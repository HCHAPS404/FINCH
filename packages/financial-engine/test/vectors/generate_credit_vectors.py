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
