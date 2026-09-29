#!/usr/bin/env python3
"""Independent reference vectors for the Colombian credit formulas (task S1-01).

This is a separate implementation of docs/financial-formulas/colombia-credit.md written
in Python with the standard `decimal` module at 60 significant digits. It never imports
or runs the TypeScript engine: the engine's tests compare against these files, so a
mistake shared by both would require the same mistake written twice, in two languages.

The founders' independent spreadsheet (task S1-03) re-derives a subset of these vectors;
until then each file records `verifiedBy: ["python-decimal-reference"]`.

Usage: python3 packages/financial-engine/test/vectors/generate_credit_vectors.py
"""
import datetime as dt
import json
import math
from decimal import ROUND_HALF_EVEN, Decimal as D, getcontext
from pathlib import Path

getcontext().prec = 60
OUT = Path(__file__).resolve().parent
SIG = 34  # significant digits recorded for rates


def sig(value: D, digits: int = SIG) -> str:
    """Plain string with `digits` significant digits, half-even, no exponent."""
    if value == 0:
        return "0"
    q = value.quantize(D(1).scaleb(value.adjusted() - digits + 1), rounding=ROUND_HALF_EVEN)
    return format(q.normalize(), "f")


# ---------------------------------------------------------------------------
# rate.convert@1 — colombia-credit.md §1
# A quote is BASIS/PERIODS/TIMING, e.g. EFFECTIVE/12/ARREARS (MV), NOMINAL/12/ARREARS (NAMV).
# ---------------------------------------------------------------------------
def to_effective_annual(rate: D, quote: str) -> D:
    basis, periods, timing = quote.split("/")
    m = int(periods)
    periodic = rate / m if basis == "NOMINAL" else rate
    if timing == "ADVANCE":
        if periodic >= 1:
            raise ValueError("advance rate >= 1")
        periodic = periodic / (1 - periodic)
    return (1 + periodic) ** m - 1


def from_effective_annual(ea: D, quote: str) -> D:
    basis, periods, timing = quote.split("/")
    m = int(periods)
    periodic = (1 + ea) ** (D(1) / D(m)) - 1
    if timing == "ADVANCE":
        periodic = periodic / (1 + periodic)
    return periodic * m if basis == "NOMINAL" else periodic


def convert(rate: str, source: str, target: str) -> str:
    return sig(from_effective_annual(to_effective_annual(D(rate), source), target))


RATE_CASES = [
    ("MV → EA (2.3 % MV, colombia-credit.md §1)", "0.023", "EFFECTIVE/12/ARREARS", "EFFECTIVE/1/ARREARS"),
    ("EA → MV (24 % EA, fractional power)", "0.24", "EFFECTIVE/1/ARREARS", "EFFECTIVE/12/ARREARS"),
    ("NAMV → MV (24 % NAMV = 2 % MV)", "0.24", "NOMINAL/12/ARREARS", "EFFECTIVE/12/ARREARS"),
    ("NAMV → EA (24 % NAMV)", "0.24", "NOMINAL/12/ARREARS", "EFFECTIVE/1/ARREARS"),
    ("monthly in advance → in arrears (2 %)", "0.02", "EFFECTIVE/12/ADVANCE", "EFFECTIVE/12/ARREARS"),
    ("EA → monthly in advance (26.8 % EA)", "0.268", "EFFECTIVE/1/ARREARS", "EFFECTIVE/12/ADVANCE"),
    ("EA → quarterly in arrears (30 % EA)", "0.30", "EFFECTIVE/1/ARREARS", "EFFECTIVE/4/ARREARS"),
    ("quarterly nominal → EA (20 % NATV)", "0.20", "NOMINAL/4/ARREARS", "EFFECTIVE/1/ARREARS"),
    ("EA → EA is the identity", "0.1875", "EFFECTIVE/1/ARREARS", "EFFECTIVE/1/ARREARS"),
    ("zero rate stays zero", "0", "EFFECTIVE/12/ARREARS", "EFFECTIVE/1/ARREARS"),
    ("high rate above 100 % EA (8 % MV)", "0.08", "EFFECTIVE/12/ARREARS", "EFFECTIVE/1/ARREARS"),
    ("EA → daily (365) nominal", "0.25", "EFFECTIVE/1/ARREARS", "NOMINAL/365/ARREARS"),
    ("semiannual effective → MV (12 % ES)", "0.12", "EFFECTIVE/2/ARREARS", "EFFECTIVE/12/ARREARS"),
]


def rate_vectors():
    vectors = [
        {
            "description": d,
            "inputs": {"rate": r, "from": s, "to": t},
            "expected": {"rate": convert(r, s, t)},
        }
        for d, r, s, t in RATE_CASES
    ]
    vectors.append(
        {
            "description": "error: a rate in advance of 100 % or more has no arrears equivalent",
            "inputs": {"rate": "1", "from": "EFFECTIVE/12/ADVANCE", "to": "EFFECTIVE/1/ARREARS"},
            "expected": {"error": "RATE_OUT_OF_DOMAIN"},
        }
    )
    vectors.append(
        {
            "description": "error: negative rates are rejected in version 1",
            "inputs": {"rate": "-0.01", "from": "EFFECTIVE/12/ARREARS", "to": "EFFECTIVE/1/ARREARS"},
            "expected": {"error": "RATE_OUT_OF_DOMAIN"},
        }
    )
    vectors.append(
        {
            "description": "error: unsupported compounding frequency",
            "inputs": {"rate": "0.02", "from": "EFFECTIVE/7/ARREARS", "to": "EFFECTIVE/1/ARREARS"},
            "expected": {"error": "UNSUPPORTED_QUOTE"},
        }
    )
    return vectors


# ---------------------------------------------------------------------------
# amortization.french@1 — colombia-credit.md §2
# Amounts in minor units. Instalment rounded half-even to the minor unit; each period's
# interest rounded half-even; the last instalment absorbs the residue so balance_n = 0.
# ---------------------------------------------------------------------------
def round_minor(x: D) -> int:
    return int(x.quantize(D(1), rounding=ROUND_HALF_EVEN))


def french(principal: int, rate: str, n: int):
    i = D(rate)
    p = D(principal)
    exact = p / n if i == 0 else p * i / (1 - (1 + i) ** (-n))
    instalment = round_minor(exact)
    balance = principal
    rows = []
    for k in range(1, n + 1):
        interest = round_minor(D(balance) * i)
        if k == n:
            principal_part = balance
            payment = principal_part + interest
        else:
            payment = instalment
            principal_part = payment - interest
        if principal_part > balance:
            raise ValueError("UNAMORTIZABLE_IN_MINOR_UNITS")
        balance -= principal_part
        rows.append({"period": k, "payment": payment, "interest": interest, "principal": principal_part, "balance": balance})
    return instalment, rows


FRENCH_CASES = [
    ("COP 10,000,000 at 1.6 % MV over 36 months (colombia-credit.md §2)", 1_000_000_000, "COP", "0.016", 36, False),
    ("zero rate: principal split evenly, residue in the last instalment", 10_000_000, "COP", "0", 3, True),
    ("single period: one payment of principal plus interest", 50_000_000, "COP", "0.02", 1, True),
    ("small amount where rounding residue matters", 1_000, "COP", "0.031", 7, True),
    ("mortgage-length term (360 months, 0.95 % MV)", 25_000_000_000, "COP", "0.0095", 360, False),
    ("USD 1,000.00 at 1 % monthly over 12 months: last instalment below C", 100_000, "USD", "0.01", 12, True),
]


def french_vectors():
    vectors = []
    for d, principal, currency, rate, n, full in FRENCH_CASES:
        instalment, rows = french(principal, rate, n)
        expected = {
            "instalment": str(instalment),
            "lastPayment": str(rows[-1]["payment"]),
            "totalInterest": str(sum(r["interest"] for r in rows)),
            "totalPaid": str(sum(r["payment"] for r in rows)),
        }
        if full:
            expected["schedule"] = [{k: str(v) for k, v in r.items()} for r in rows]
        vectors.append({"description": d, "inputs": {"principal": str(principal), "currency": currency, "rate": rate, "periods": str(n)}, "expected": expected})
    vectors.append(
        {
            "description": "error: zero periods",
            "inputs": {"principal": "100000", "currency": "COP", "rate": "0.01", "periods": "0"},
            "expected": {"error": "INVALID_TERM"},
        }
    )
    vectors.append(
        {
            "description": "error: non-positive principal",
            "inputs": {"principal": "0", "currency": "COP", "rate": "0.01", "periods": "12"},
            "expected": {"error": "INVALID_PRINCIPAL"},
        }
    )
    # 6 minor units over 8 periods at 0 %: C = 0.75 rounds to 1, which repays the whole
    # principal by period 6 and would drive the balance negative in period 7.
    try:
        french(6, "0", 8)
        raise AssertionError("expected the unamortizable case to be rejected")
    except ValueError as error:
        assert str(error) == "UNAMORTIZABLE_IN_MINOR_UNITS"
    vectors.append(
        {
            "description": "error: instalment rounding repays the principal before the last period",
            "inputs": {"principal": "6", "currency": "COP", "rate": "0", "periods": "8"},
            "expected": {"error": "UNAMORTIZABLE_IN_MINOR_UNITS"},
        }
    )
    return vectors


# ---------------------------------------------------------------------------
# credit.total_cost@1 — colombia-credit.md §3
# Monthly cash flows from the borrower's side. The reference solves the IRR with Newton's
# method to 1e-50 (the engine uses bisection, a different algorithm, so the two can only
# agree if both are right). Expected rates are recorded with 20 significant digits and
# the engine is checked within tolerance: 1e-11 monthly, 1e-9 effective annual.
# ---------------------------------------------------------------------------
def total_cost(principal, rate, n, upfront=0, insurance=("NONE", None), handling=0, other=0, gmf="0"):
    if upfront < 0 or handling < 0 or other < 0 or upfront >= principal:
        raise ValueError("INVALID_CHARGES")
    g = D(gmf)
    if g < 0 or g >= 1:
        raise ValueError("RATE_OUT_OF_DOMAIN")
    basis, value = insurance
    if basis in ("OUTSTANDING", "ORIGINAL") and D(value) < 0:
        raise ValueError("INVALID_CHARGES")
    if basis == "FIXED" and value < 0:
        raise ValueError("INVALID_CHARGES")
    instalment, rows = french(principal, rate, n)
    balance = principal
    outflows = []
    tot = {"interest": 0, "insurance": 0, "fees": 0, "gmf": 0}
    for r in rows:
        if basis == "NONE":
            ins = 0
        elif basis == "OUTSTANDING":
            ins = round_minor(D(value) * D(balance))  # balance before this payment
        elif basis == "ORIGINAL":
            ins = round_minor(D(value) * D(principal))
        else:
            ins = value
        debit = r["payment"] + ins + handling + other
        tax = round_minor(g * D(debit))
        outflows.append(debit + tax)
        tot["interest"] += r["interest"]
        tot["insurance"] += ins
        tot["fees"] += handling + other
        tot["gmf"] += tax
        balance = r["balance"]
    net = principal - upfront

    def npv(x):
        return D(net) - sum(D(o) / (1 + x) ** k for k, o in enumerate(outflows, start=1))

    def dnpv(x):
        return sum(D(k) * D(o) / (1 + x) ** (k + 1) for k, o in enumerate(outflows, start=1))

    x = D(rate) if D(rate) > 0 else D("0.01")
    if D(net) == sum(D(o) for o in outflows):
        x = D(0)
    else:
        for _ in range(200):
            step = npv(x) / dnpv(x)
            x -= step
            if abs(step) < D("1e-50"):
                break
        else:
            raise AssertionError("Newton did not converge")
    total_paid = sum(outflows)
    return {
        "monthlyIrr": sig(x, 20),
        "effectiveAnnualRate": sig((1 + x) ** 12 - 1, 20),
        "instalment": str(instalment),
        "netDisbursement": str(net),
        "totalPaid": str(total_paid),
        "totalInterest": str(tot["interest"]),
        "totalInsurance": str(tot["insurance"]),
        "totalFees": str(tot["fees"]),
        "totalGmf": str(tot["gmf"]),
        "upfrontCosts": str(upfront),
        "totalCost": str(total_paid - net),
    }


TOTAL_COST_CASES = [
    ("no charges: the IRR equals the loan rate up to minor-unit rounding",
     {"principal": 1_000_000_000, "rate": "0.016", "n": 36}),
    ("life insurance on the outstanding balance (0.12 % monthly)",
     {"principal": 1_000_000_000, "rate": "0.016", "n": 36, "insurance": ("OUTSTANDING", "0.0012")}),
    ("life insurance on the original amount (0.12 % monthly)",
     {"principal": 1_000_000_000, "rate": "0.016", "n": 36, "insurance": ("ORIGINAL", "0.0012")}),
    ("fixed insurance plus monthly handling fee",
     {"principal": 1_000_000_000, "rate": "0.016", "n": 36, "insurance": ("FIXED", 1_500_000), "handling": 1_200_000}),
    ("upfront costs (credit study, 2 %) reduce the net disbursement",
     {"principal": 1_000_000_000, "rate": "0.016", "n": 36, "upfront": 20_000_000}),
    ("GMF 4 x 1,000 on every debit, with insurance and fees",
     {"principal": 1_000_000_000, "rate": "0.016", "n": 36, "insurance": ("OUTSTANDING", "0.0012"),
      "handling": 1_200_000, "other": 300_000, "gmf": "0.004"}),
    ("zero-rate loan with an upfront fee still has a positive real rate",
     {"principal": 120_000_000, "rate": "0", "n": 12, "upfront": 3_000_000}),
]


def encode_total_cost_inputs(c):
    basis, value = c.get("insurance", ("NONE", None))
    inputs = {
        "principal": str(c["principal"]),
        "currency": "COP",
        "rate": c["rate"],
        "periods": str(c["n"]),
        "upfrontCosts": str(c.get("upfront", 0)),
        "insuranceBasis": basis,
        "handlingFee": str(c.get("handling", 0)),
        "otherCharges": str(c.get("other", 0)),
        "gmfRate": c.get("gmf", "0"),
    }
    if basis in ("OUTSTANDING", "ORIGINAL"):
        inputs["insuranceRate"] = value
    if basis == "FIXED":
        inputs["insuranceAmount"] = str(value)
    return inputs


def total_cost_vectors():
    vectors = []
    for d, c in TOTAL_COST_CASES:
        expected = total_cost(c["principal"], c["rate"], c["n"], c.get("upfront", 0), c.get("insurance", ("NONE", None)),
                              c.get("handling", 0), c.get("other", 0), c.get("gmf", "0"))
        vectors.append({"description": d, "inputs": encode_total_cost_inputs(c), "expected": expected})
    for d, c, code in [
        ("error: upfront costs equal to the principal leave nothing disbursed",
         {"principal": 1_000_000, "rate": "0.01", "n": 12, "upfront": 1_000_000}, "INVALID_CHARGES"),
        ("error: a GMF rate of 100 % is out of domain",
         {"principal": 1_000_000, "rate": "0.01", "n": 12, "gmf": "1"}, "RATE_OUT_OF_DOMAIN"),
    ]:
        try:
            total_cost(c["principal"], c["rate"], c["n"], c.get("upfront", 0), ("NONE", None), 0, 0, c.get("gmf", "0"))
            raise AssertionError("expected " + code)
        except ValueError as error:
            assert str(error) == code
        vectors.append({"description": d, "inputs": encode_total_cost_inputs(c), "expected": {"error": code}})
    return vectors


# ---------------------------------------------------------------------------
# credit.usury_check@1 — colombia-credit.md §4
# Compares the agreed remunerative rate (EA) with the certified usury rate (EA). The
# certification is valid for [validFrom, validTo]; outside it the source is STALE and the
# result says so rather than silently using an expired ceiling.
# ---------------------------------------------------------------------------
def usury(agreed: str, usury_rate: str, valid_from: str, valid_to: str, as_of: str):
    a, u = D(agreed), D(usury_rate)
    if a < 0 or u <= 0:
        raise ValueError("RATE_OUT_OF_DOMAIN")
    if valid_from > valid_to:
        raise ValueError("INVALID_VALIDITY_PERIOD")
    return {
        "status": "BELOW" if a < u else "AT_OR_ABOVE",
        "marginPp": format(((a - u) * 100).normalize(), "f"),
        "sourceStatus": "CURRENT" if valid_from <= as_of <= valid_to else "STALE",
    }


USURY_CASES = [
    ("below the usury rate", "0.2400", "0.2862", "2026-10-01", "2026-10-31", "2026-10-15"),
    ("exactly at the usury rate counts as AT_OR_ABOVE", "0.2862", "0.2862", "2026-10-01", "2026-10-31", "2026-10-01"),
    ("above the usury rate", "0.3137344983996021269289886802331443", "0.2862", "2026-10-01", "2026-10-31", "2026-10-31"),
    ("certification expired: result is marked STALE", "0.2400", "0.2862", "2026-09-01", "2026-09-30", "2026-10-15"),
]


def usury_vectors():
    vectors = [
        {
            "description": d,
            "inputs": {"agreedRateEA": a, "usuryRateEA": u, "validFrom": f, "validTo": t, "asOf": o},
            "expected": usury(a, u, f, t, o),
        }
        for d, a, u, f, t, o in USURY_CASES
    ]
    vectors.append(
        {
            "description": "error: a validity period that ends before it starts",
            "inputs": {"agreedRateEA": "0.2", "usuryRateEA": "0.28", "validFrom": "2026-10-31", "validTo": "2026-10-01", "asOf": "2026-10-15"},
            "expected": {"error": "INVALID_VALIDITY_PERIOD"},
        }
    )
    return vectors


# ---------------------------------------------------------------------------
# credit.compare_refinance@1 — colombia-credit.md §5
# The current debt keeps its French schedule on the remaining balance; the offer
# refinances that same balance. Monthly charges are added to each instalment; switching
# costs are paid out of pocket at t = 0. Present values are discounted at the monthly
# opportunity rate and rounded HALF_EVEN to the minor unit once, at the end.
# ---------------------------------------------------------------------------
def flows(balance, rate, n, charges):
    _, rows = french(balance, rate, n)
    return [r["payment"] + charges for r in rows]


def pv(values, rate):
    r = D(rate)
    return sum(D(v) / (1 + r) ** k for k, v in enumerate(values, start=1))


def refinance(balance, cur_rate, cur_n, cur_charges, off_rate, off_n, off_charges, switching, opp, truths):
    current = flows(balance, cur_rate, cur_n, cur_charges)
    offer = flows(balance, off_rate, off_n, off_charges)
    total_current = sum(current)
    total_offer = sum(offer) + switching
    pv_savings = round_minor(pv(current, opp) - pv(offer, opp) - D(switching))
    break_even = None
    cumulative = 0
    for k in range(1, max(cur_n, off_n) + 1):
        cumulative += (current[k - 1] if k <= cur_n else 0) - (offer[k - 1] if k <= off_n else 0)
        if cumulative >= switching:
            break_even = k
            break
    delta = offer[0] - current[0]
    return {
        "currentInstalment": str(current[0]),
        "offerInstalment": str(offer[0]),
        "instalmentDelta": str(delta),
        "totalCurrent": str(total_current),
        "totalOffer": str(total_offer),
        "nominalSavings": str(total_current - total_offer),
        "pvSavings": str(pv_savings),
        "breakEvenMonth": "none" if break_even is None else str(break_even),
        "longerTermAlert": "true" if delta < 0 and total_offer > total_current else "false",
        "truthClass": "ESTIMATED" if "ESTIMATED" in truths else "DERIVED_DETERMINISTIC",
    }


REFINANCE_CASES = [
    ("lower rate, same term, no switching costs: savings from month 1",
     dict(balance=800_000_000, cur_rate="0.025", cur_n=24, cur_charges=0, off_rate="0.017", off_n=24,
          off_charges=0, switching=0, opp="0.008", truths=["OBSERVED", "USER_ASSERTED"])),
    ("lower rate with switching costs: break-even after a few months",
     dict(balance=800_000_000, cur_rate="0.025", cur_n=24, cur_charges=0, off_rate="0.017", off_n=24,
          off_charges=0, switching=25_000_000, opp="0.008", truths=["OBSERVED", "USER_ASSERTED"])),
    ("longer term: lower instalment but more paid in total (alert)",
     dict(balance=800_000_000, cur_rate="0.02", cur_n=12, cur_charges=0, off_rate="0.018", off_n=48,
          off_charges=0, switching=0, opp="0.008", truths=["OBSERVED", "USER_ASSERTED"])),
    ("worse offer: never breaks even",
     dict(balance=500_000_000, cur_rate="0.015", cur_n=18, cur_charges=0, off_rate="0.019", off_n=18,
          off_charges=500_000, switching=5_000_000, opp="0.008", truths=["OBSERVED", "USER_ASSERTED"])),
    ("monthly charges on the current debt make the offer cheaper",
     dict(balance=300_000_000, cur_rate="0.02", cur_n=36, cur_charges=1_800_000, off_rate="0.02", off_n=36,
          off_charges=0, switching=2_000_000, opp="0.008", truths=["OBSERVED", "USER_ASSERTED"])),
    ("estimated opportunity rate makes the whole result ESTIMATED",
     dict(balance=800_000_000, cur_rate="0.025", cur_n=24, cur_charges=0, off_rate="0.017", off_n=24,
          off_charges=0, switching=25_000_000, opp="0.01", truths=["OBSERVED", "ESTIMATED"])),
]


def refinance_vectors():
    vectors = []
    for d, c in REFINANCE_CASES:
        inputs = {
            "balance": str(c["balance"]), "currency": "COP",
            "currentRate": c["cur_rate"], "currentPeriods": str(c["cur_n"]), "currentCharges": str(c["cur_charges"]),
            "offerRate": c["off_rate"], "offerPeriods": str(c["off_n"]), "offerCharges": str(c["off_charges"]),
            "switchingCosts": str(c["switching"]), "opportunityRate": c["opp"],
            "currentTruth": c["truths"][0], "opportunityRateTruth": c["truths"][1],
        }
        vectors.append({"description": d, "inputs": inputs, "expected": refinance(**c)})
    return vectors


# ---------------------------------------------------------------------------
# debt.payoff_plan@1 — colombia-credit.md §6
# Constant monthly budget B = sum of minimum payments + extra. Each month: interest
# accrues on every open debt (HALF_EVEN per debt), minimums are paid (capped at the
# balance), and whatever is left of B goes to the priority debt, cascading to the next
# one when a debt is cleared. Minimums of cleared debts roll into the surplus.
# AVALANCHE: highest monthly rate first. SNOWBALL: smallest current balance first.
# Ties keep the input order. The plan fails if the budget does not cover the first
# month's interest, or if the debt is not cleared within 1,200 months.
# ---------------------------------------------------------------------------
def payoff(debts, extra, strategy):
    balances = [d["balance"] for d in debts]
    rates = [D(d["rate"]) for d in debts]
    minimums = [d["minimum"] for d in debts]
    budget = sum(minimums) + extra
    first_interest = sum(round_minor(D(b) * r) for b, r in zip(balances, rates))
    if budget <= first_interest:
        raise ValueError("DEBT_NEVER_AMORTIZES")
    total_interest = 0
    total_paid = 0
    order = []
    month = 0
    while any(b > 0 for b in balances):
        month += 1
        if month > 1200:
            raise ValueError("DEBT_NEVER_AMORTIZES")
        for j, b in enumerate(balances):
            if b > 0:
                interest = round_minor(D(b) * rates[j])
                balances[j] = b + interest
                total_interest += interest
        remaining = budget
        for j, b in enumerate(balances):
            if b > 0:
                pay = min(minimums[j], b)
                balances[j] -= pay
                remaining -= pay
        open_ids = [j for j, b in enumerate(balances) if b > 0]
        if strategy == "AVALANCHE":
            open_ids.sort(key=lambda j: (-rates[j], j))
        else:
            open_ids.sort(key=lambda j: (balances[j], j))
        for j in open_ids:
            if remaining <= 0:
                break
            pay = min(remaining, balances[j])
            balances[j] -= pay
            remaining -= pay
        total_paid += budget - remaining
        for j, b in enumerate(balances):
            if b == 0 and debts[j]["id"] not in [o["id"] for o in order]:
                order.append({"id": debts[j]["id"], "month": str(month)})
    return {
        "monthsToDebtFree": str(month),
        "totalInterest": str(total_interest),
        "totalPaid": str(total_paid),
        "payoffOrder": order,
    }


PAYOFF_DEBTS = [
    {"id": "card-a", "balance": 450_000_000, "rate": "0.028", "minimum": 18_000_000},
    {"id": "card-b", "balance": 120_000_000, "rate": "0.021", "minimum": 6_000_000},
    {"id": "loan-c", "balance": 900_000_000, "rate": "0.014", "minimum": 30_000_000},
]

PAYOFF_CASES = [
    ("three debts with COP 500,000 extra", PAYOFF_DEBTS, 50_000_000),
    ("three debts with no extra: minimums still roll over", PAYOFF_DEBTS, 0),
    ("the smallest balance has the highest rate: both strategies agree",
     [{"id": "small-high", "balance": 100_000_000, "rate": "0.03", "minimum": 5_000_000},
      {"id": "big-low", "balance": 600_000_000, "rate": "0.012", "minimum": 20_000_000}], 10_000_000),
]


def payoff_vectors():
    vectors = []
    for d, debts, extra in PAYOFF_CASES:
        inputs = {
            "currency": "COP",
            "extra": str(extra),
            "debts": [{"id": x["id"], "balance": str(x["balance"]), "rate": x["rate"], "minimum": str(x["minimum"])} for x in debts],
        }
        vectors.append({
            "description": d,
            "inputs": inputs,
            "expected": {"AVALANCHE": payoff(debts, extra, "AVALANCHE"), "SNOWBALL": payoff(debts, extra, "SNOWBALL")},
        })
    impossible = [{"id": "card", "balance": 1_000_000_000, "rate": "0.03", "minimum": 20_000_000}]
    try:
        payoff(impossible, 5_000_000, "AVALANCHE")
        raise AssertionError("expected DEBT_NEVER_AMORTIZES")
    except ValueError as error:
        assert str(error) == "DEBT_NEVER_AMORTIZES"
    vectors.append({
        "description": "error: the budget does not cover the interest, the debt never shrinks",
        "inputs": {"currency": "COP", "extra": "5000000",
                   "debts": [{"id": "card", "balance": "1000000000", "rate": "0.03", "minimum": "20000000"}]},
        "expected": {"error": "DEBT_NEVER_AMORTIZES"},
    })
    return vectors


# ---------------------------------------------------------------------------
# cashflow.forecast_30d@1 — colombia-credit.md §7
# End-of-day balances for d = today .. today + 30. Events may shift off non-business days
# (weekend and holidays are parameters, never hard-coded). A variable income is the
# conservative 25th percentile of its history by nearest rank (the ceil(0.25 n)-th
# smallest value), which makes the series ESTIMATED.
# ---------------------------------------------------------------------------
def business(day, weekend, holidays):
    return day.isoweekday() not in weekend and day.isoformat() not in holidays


def shift(day, rule, weekend, holidays):
    step = {"NONE": 0, "NEXT_BUSINESS_DAY": 1, "PREVIOUS_BUSINESS_DAY": -1}[rule]
    while step and not business(day, weekend, holidays):
        day += dt.timedelta(days=step)
    return day


def p25(history):
    ordered = sorted(history)
    return ordered[math.ceil(len(ordered) * 0.25) - 1]


def forecast(today, start, buffer, weekend, holidays, events, start_truth="OBSERVED"):
    t0 = dt.date.fromisoformat(today)
    days = [t0 + dt.timedelta(days=k) for k in range(31)]
    delta = {d: 0 for d in days}
    truths = [start_truth]
    for e in events:
        amount = p25(e["history"]) if "history" in e else e["amount"]
        truth = "ESTIMATED" if "history" in e else e["truth"]
        day = shift(dt.date.fromisoformat(e["date"]), e.get("shift", "NONE"), weekend, holidays)
        if day in delta:
            delta[day] += amount if e["kind"] == "INCOME" else -amount
            truths.append(truth)
    balance = start
    series = []
    for d in days:
        balance += delta[d]
        series.append({"date": d.isoformat(), "balance": str(balance)})
    first_deficit = next(({"date": x["date"], "shortfall": str(buffer - int(x["balance"]))}
                          for x in series if int(x["balance"]) < buffer), None)
    low = min(series, key=lambda x: int(x["balance"]))  # first occurrence of the minimum
    return {
        "series": series,
        "firstDeficit": first_deficit if first_deficit else "none",
        "minimum": low,
        "truthClass": "ESTIMATED" if "ESTIMATED" in truths else "DERIVED_DETERMINISTIC",
    }


# Synthetic calendar parameters for the vectors (the real calendar lives in
# jurisdictions/CO/calendar with its source): Saturday/Sunday weekend and one holiday.
WEEKEND = [6, 7]
HOLIDAYS = ["2026-11-02"]

FORECAST_CASES = [
    ("no deficit: salary covers every obligation",
     dict(today="2026-10-15", start=150_000_000, buffer=20_000_000, events=[
         {"id": "rent", "kind": "OBLIGATION", "date": "2026-10-20", "amount": 90_000_000, "truth": "USER_ASSERTED"},
         {"id": "salary", "kind": "INCOME", "date": "2026-10-30", "amount": 420_000_000, "truth": "OBSERVED"},
         {"id": "card", "kind": "OBLIGATION", "date": "2026-11-05", "amount": 60_000_000, "truth": "OBSERVED"},
     ])),
    ("deficit: rent and card land before the salary",
     dict(today="2026-10-15", start=80_000_000, buffer=20_000_000, events=[
         {"id": "rent", "kind": "OBLIGATION", "date": "2026-10-20", "amount": 90_000_000, "truth": "USER_ASSERTED"},
         {"id": "card", "kind": "OBLIGATION", "date": "2026-10-25", "amount": 60_000_000, "truth": "OBSERVED"},
         {"id": "salary", "kind": "INCOME", "date": "2026-10-30", "amount": 420_000_000, "truth": "OBSERVED"},
     ])),
    ("holiday and weekend shifts: a payment due on a holiday moves to the next business day, "
     "a salary due on a Saturday moves to the previous one",
     dict(today="2026-10-15", start=100_000_000, buffer=10_000_000, events=[
         {"id": "loan", "kind": "OBLIGATION", "date": "2026-11-02", "amount": 70_000_000, "truth": "OBSERVED",
          "shift": "NEXT_BUSINESS_DAY"},
         {"id": "salary", "kind": "INCOME", "date": "2026-10-31", "amount": 300_000_000, "truth": "OBSERVED",
          "shift": "PREVIOUS_BUSINESS_DAY"},
         {"id": "gym", "kind": "OBLIGATION", "date": "2026-10-18", "amount": 12_000_000, "truth": "USER_ASSERTED",
          "shift": "NEXT_BUSINESS_DAY"},
     ])),
    ("variable income: 25th percentile of six months, series becomes ESTIMATED",
     dict(today="2026-10-15", start=40_000_000, buffer=15_000_000, events=[
         {"id": "freelance", "kind": "INCOME", "date": "2026-10-28",
          "history": [210_000_000, 95_000_000, 180_000_000, 130_000_000, 260_000_000, 120_000_000]},
         {"id": "rent", "kind": "OBLIGATION", "date": "2026-11-01", "amount": 90_000_000, "truth": "USER_ASSERTED"},
     ])),
]


def encode_events(events):
    out = []
    for e in events:
        x = {"id": e["id"], "kind": e["kind"], "date": e["date"], "shift": e.get("shift", "NONE")}
        if "history" in e:
            x["history"] = [str(h) for h in e["history"]]
        else:
            x["amount"] = str(e["amount"])
            x["truth"] = e["truth"]
        out.append(x)
    return out


def encode_forecast_inputs(c):
    return {"today": c["today"], "currency": "COP", "startingBalance": str(c["start"]),
            "buffer": str(c["buffer"]), "weekend": WEEKEND, "holidays": HOLIDAYS,
            "events": encode_events(c["events"])}


def forecast_vectors():
    return [
        {"description": d, "inputs": encode_forecast_inputs(c),
         "expected": forecast(c["today"], c["start"], c["buffer"], WEEKEND, HOLIDAYS, c["events"])}
        for d, c in FORECAST_CASES
    ]


# ---------------------------------------------------------------------------
# cashflow.safe_to_spend@1 — colombia-credit.md §8
# STS = max(0, min over d in [today, next_income] of balance_d − buffer), where
# next_income is the first day after today with an income event in the forecast. With
# no known next income the whole 30-day horizon is used and the result says so.
# ---------------------------------------------------------------------------
def safe_to_spend(c):
    f = forecast(c["today"], c["start"], c["buffer"], WEEKEND, HOLIDAYS, c["events"])
    t0 = dt.date.fromisoformat(c["today"])
    income_days = sorted(
        shift(dt.date.fromisoformat(e["date"]), e.get("shift", "NONE"), WEEKEND, HOLIDAYS)
        for e in c["events"] if e["kind"] == "INCOME")
    upcoming = [d for d in income_days if t0 < d <= t0 + dt.timedelta(days=30)]
    end = upcoming[0] if upcoming else t0 + dt.timedelta(days=30)
    window = [int(x["balance"]) for x in f["series"] if x["date"] <= end.isoformat()]
    return {
        "safeToSpend": str(max(0, min(window) - c["buffer"])),
        "windowEnd": end.isoformat(),
        "nextIncomeKnown": "true" if upcoming else "false",
        "truthClass": f["truthClass"],
    }


STS_CASES = [
    ("positive: the lowest balance before payday stays above the buffer", FORECAST_CASES[0][1]),
    ("zero: obligations before payday exceed what is available", FORECAST_CASES[1][1]),
    ("no known next income: the whole horizon is used",
     dict(today="2026-10-15", start=200_000_000, buffer=30_000_000, events=[
         {"id": "rent", "kind": "OBLIGATION", "date": "2026-10-20", "amount": 90_000_000, "truth": "USER_ASSERTED"},
         {"id": "card", "kind": "OBLIGATION", "date": "2026-11-10", "amount": 50_000_000, "truth": "OBSERVED"},
     ])),
]


def sts_vectors():
    return [{"description": d, "inputs": encode_forecast_inputs(c), "expected": safe_to_spend(c)}
            for d, c in STS_CASES]


def write(formula_id: str, version: int, vectors: list) -> None:
    doc = {
        "formulaId": formula_id,
        "version": version,
        "spec": "docs/financial-formulas/colombia-credit.md",
        "generatedBy": "packages/financial-engine/test/vectors/generate_credit_vectors.py (Python decimal, 60 digits)",
        "verifiedBy": ["python-decimal-reference"],
        "vectors": vectors,
    }
    path = OUT / f"{formula_id}@{version}.json"
    path.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"wrote {path.name}: {len(vectors)} vectors")


if __name__ == "__main__":
    write("rate.convert", 1, rate_vectors())
    write("amortization.french", 1, french_vectors())
    write("credit.total_cost", 1, total_cost_vectors())
    write("credit.usury_check", 1, usury_vectors())
    write("credit.compare_refinance", 1, refinance_vectors())
    write("debt.payoff_plan", 1, payoff_vectors())
    write("cashflow.forecast_30d", 1, forecast_vectors())
    write("cashflow.safe_to_spend", 1, sts_vectors())
