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
import json
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
