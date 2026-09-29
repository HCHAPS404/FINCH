#!/usr/bin/env python3
"""Independent reference vectors for personal-finance formulas (task S1-02).

A separate Python implementation of docs/financial-formulas/personal-finance.md §1–§2 that never
imports or runs the TypeScript engine. Amounts are integers in minor units; the only rounding is
HALF_EVEN on the pay-yourself-first and surplus shares.

Usage: python3 packages/financial-engine/test/vectors/generate_personal_vectors.py
"""
import json
from decimal import ROUND_HALF_EVEN, Decimal as D, getcontext
from pathlib import Path

getcontext().prec = 60
OUT = Path(__file__).resolve().parent


def round_minor(x: D) -> int:
    return int(x.quantize(D(1), rounding=ROUND_HALF_EVEN))


# ---------------------------------------------------------------------------
# budget.allocate@1 — personal-finance.md §1 (resolved version-1 definitions)
# Layers consume `remaining` in order:
#   1 OBLIGATION  due <= next_income, by due date then input order (full amount)
#   2 DEBT_MINIMUM due <= next_income, by due date then input order (full amount)
#   -- if remaining < 0 here: deficit, shortfall = -remaining, nothing else allocated --
#   3 PAY_YOURSELF_FIRST min(remaining, round(p * income)); p = 0.20 for RULE_50_30_20
#   4 BUFFER  min(remaining, max(0, target - current), cap_per_cycle)
#   5 GOAL    by priority asc, target date asc, input order: min(remaining, suggested)
#   6 SURPLUS round(surplus_share * remaining) to the strategy target
#             (DEBT_AVALANCHE: highest-rate debt, capped at its balance; SAVINGS: savings)
#   7 FREE    remaining
# Invariant: sum(allocations) + free = income + shortfall.
# ---------------------------------------------------------------------------
def allocate(c):
    income = c["income"]
    nxt = c["nextIncome"]
    remaining = income
    lines = []

    def add(layer, dest, amount):
        nonlocal remaining
        if amount > 0:
            lines.append({"layer": layer, "destination": dest, "amount": str(amount)})
            remaining -= amount

    obligations = sorted(
        [(o["dueDate"], k, o) for k, o in enumerate(c["obligations"]) if o["dueDate"] <= nxt])
    for _, _, o in obligations:
        add("OBLIGATION", o["id"], o["amount"])
    debts = sorted([(d["dueDate"], k, d) for k, d in enumerate(c["debts"]) if d["dueDate"] <= nxt])
    for _, _, d in debts:
        add("DEBT_MINIMUM", d["id"], d["minimum"])
    if remaining < 0:
        return {"lines": lines, "free": "0", "shortfall": str(-remaining)}

    rule = c["rule"]
    p = D("0.20") if rule["kind"] == "RULE_50_30_20" else D(rule.get("rate", "0"))
    add("PAY_YOURSELF_FIRST", "savings", min(remaining, round_minor(p * D(income))))

    b = c["buffer"]
    add("BUFFER", "buffer", min(remaining, max(0, b["target"] - b["current"]), b["capPerCycle"]))

    goals = sorted([(g["priority"], g["targetDate"], k, g) for k, g in enumerate(c["goals"])])
    for _, _, _, g in goals:
        add("GOAL", g["id"], min(remaining, g["suggested"]))

    share = round_minor(D(c["surplusShare"]) * D(remaining))
    if c["strategy"] == "DEBT_AVALANCHE" and c["debts"]:
        target = sorted([(-D(d["rate"]), k, d) for k, d in enumerate(c["debts"])])[0][2]
        add("SURPLUS", target["id"], min(share, target["balance"]))
    else:
        add("SURPLUS", "savings", share)
    return {"lines": lines, "free": str(remaining), "shortfall": "0"}


BASE = {
    "income": 450_000_000, "incomeDate": "2026-10-15", "nextIncome": "2026-10-30",
    "obligations": [
        {"id": "internet", "amount": 12_000_000, "dueDate": "2026-10-25"},
        {"id": "rent", "amount": 150_000_000, "dueDate": "2026-10-20"},
        {"id": "insurance", "amount": 9_000_000, "dueDate": "2026-11-05"},
    ],
    "debts": [
        {"id": "card", "minimum": 25_000_000, "dueDate": "2026-10-22", "rate": "0.028", "balance": 300_000_000},
        {"id": "loan", "minimum": 40_000_000, "dueDate": "2026-10-18", "rate": "0.016", "balance": 900_000_000},
    ],
    "rule": {"kind": "PAY_YOURSELF_FIRST", "rate": "0.1"},
    "buffer": {"target": 200_000_000, "current": 150_000_000, "capPerCycle": 30_000_000},
    "goals": [
        {"id": "trip", "priority": 2, "targetDate": "2027-06-01", "suggested": 20_000_000},
        {"id": "laptop", "priority": 1, "targetDate": "2027-01-15", "suggested": 35_000_000},
        {"id": "course", "priority": 2, "targetDate": "2027-02-01", "suggested": 15_000_000},
    ],
    "strategy": "DEBT_AVALANCHE", "surplusShare": "0.5",
}

ALLOCATE_CASES = [
    ("all seven layers; avalanche surplus to the highest-rate debt", BASE),
    ("50/30/20 rule and SAVINGS strategy", {**BASE, "rule": {"kind": "RULE_50_30_20"}, "strategy": "SAVINGS"}),
    ("deficit: obligations and minimums exceed income, nothing else allocated",
     {**BASE, "income": 200_000_000}),
    ("small income: goals are only partly funded, free is zero",
     {**BASE, "income": 300_000_000, "rule": {"kind": "NONE"}}),
    ("no obligations, no debts, no goals: everything after the buffer is surplus and free",
     {**BASE, "obligations": [], "debts": [], "goals": [], "strategy": "SAVINGS", "surplusShare": "0.3"}),
]


def allocate_vectors():
    out = []
    for d, c in ALLOCATE_CASES:
        inputs = json.loads(json.dumps(c), parse_int=str)  # every integer as a string
        out.append({"description": d, "inputs": inputs, "expected": allocate(c)})
    return out


# ---------------------------------------------------------------------------
# budget.envelope_state@1 — personal-finance.md §2
# available = allocated − Σ expenses + Σ transfers_in − Σ transfers_out
# alert: LIMIT_100 if spent ≥ allocated (and spent > 0), else WARN_80 if spent ≥ 0.8·allocated, else NONE
# ---------------------------------------------------------------------------
def envelope(c):
    spent = sum(c["expenses"])
    budget = c["allocated"] + sum(c["transfersIn"]) - sum(c["transfersOut"])
    available = budget - spent
    if spent > 0 and spent >= budget:
        alert = "LIMIT_100"
    elif spent > 0 and 5 * spent >= 4 * budget:
        alert = "WARN_80"
    else:
        alert = "NONE"
    return {"spent": str(spent), "available": str(available), "alert": alert}


ENVELOPE_CASES = [
    ("under 80 %: no alert", {"allocated": 100_000_000, "expenses": [20_000_000, 15_000_000], "transfersIn": [], "transfersOut": []}),
    ("exactly 80 %: warning", {"allocated": 100_000_000, "expenses": [50_000_000, 30_000_000], "transfersIn": [], "transfersOut": []}),
    ("over budget: limit and negative available", {"allocated": 100_000_000, "expenses": [70_000_000, 45_000_000], "transfersIn": [], "transfersOut": []}),
    ("transfers change the budget the alert is measured against",
     {"allocated": 100_000_000, "expenses": [90_000_000], "transfersIn": [30_000_000], "transfersOut": [5_000_000]}),
    ("empty envelope with no spending: no alert", {"allocated": 0, "expenses": [], "transfersIn": [], "transfersOut": []}),
]


def envelope_vectors():
    return [{"description": d, "inputs": json.loads(json.dumps(c), parse_int=str), "expected": envelope(c)}
            for d, c in ENVELOPE_CASES]


def write(formula_id, version, vectors):
    doc = {
        "formulaId": formula_id,
        "version": version,
        "spec": "docs/financial-formulas/personal-finance.md",
        "generatedBy": "packages/financial-engine/test/vectors/generate_personal_vectors.py (Python decimal, 60 digits)",
        "verifiedBy": ["python-decimal-reference"],
        "vectors": vectors,
    }
    path = OUT / f"{formula_id}@{version}.json"
    path.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"wrote {path.name}: {len(vectors)} vectors")


if __name__ == "__main__":
    write("budget.allocate", 1, allocate_vectors())
    write("budget.envelope_state", 1, envelope_vectors())
