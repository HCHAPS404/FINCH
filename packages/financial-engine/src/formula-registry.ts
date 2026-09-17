/**
 * Formula registry — README §14.2, §95.
 *
 * Every financial formula is a versioned, documented artifact. When a formula changes,
 * it gets a NEW version; the old one keeps existing so a decision made last March can
 * still be reproduced exactly (Constitution §4.5).
 *
 * This matters most during an incident: README §95 requires identifying which formula
 * version produced an incorrect figure, finding the affected Decision Cards, and
 * superseding them — none of which is possible if formulas are anonymous functions
 * that were edited in place.
 */

export interface FormulaTestVector {
  readonly description: string;
  readonly inputs: Readonly<Record<string, string>>;
  readonly expected: string;
}

export interface FormulaDefinition {
  /** Stable identifier, e.g. `amortization.french`. Never reused for different math. */
  readonly formulaId: string;
  /** Incremented on ANY change to the computation. Never edited in place. */
  readonly version: number;
  readonly purpose: string;
  readonly inputs: readonly { name: string; unit: string; description: string }[];
  readonly outputUnit: string;
  readonly rounding: string;
  readonly assumptions: readonly string[];
  /** Citation: standard, regulation, textbook or internal specification. */
  readonly reference: string;
  readonly edgeCases: readonly string[];
  /** Path to the implementation, so the registry entry cannot drift into fiction. */
  readonly implementationPath: string;
  readonly testVectors: readonly FormulaTestVector[];
}

/**
 * The registry.
 *
 * Foundation registers the money primitives only. Amortization, refinancing, cashflow,
 * forecast, stress and safe-to-spend arrive with FIN-038 onward, each with its own
 * entry and its own golden vectors before it is allowed to inform a recommendation
 * (README §15: "Debe existir antes de recomendaciones reales").
 */
const REGISTRY = new Map<string, FormulaDefinition>();

export function registerFormula(definition: FormulaDefinition): void {
  const key = `${definition.formulaId}@${definition.version}`;
  if (REGISTRY.has(key)) {
    throw new Error(
      `Formula ${key} is already registered. Changing a formula requires a NEW version, ` +
        'never an in-place edit (README §14.2).',
    );
  }
  REGISTRY.set(key, definition);
}

export function getFormula(formulaId: string, version: number): FormulaDefinition {
  const definition = REGISTRY.get(`${formulaId}@${version}`);
  if (definition === undefined) {
    throw new Error(
      `Formula ${formulaId}@${version} is not registered. A financial result must always ` +
        'be attributable to a known formula version (README §11, §95).',
    );
  }
  return definition;
}

export function listFormulas(): readonly FormulaDefinition[] {
  return [...REGISTRY.values()];
}

// --- Foundation registrations ---------------------------------------------

registerFormula({
  formulaId: 'money.allocate',
  version: 1,
  purpose:
    'Split a monetary amount into parts proportional to weights while conserving the ' +
    'total exactly, so no minor unit is created or destroyed.',
  inputs: [
    { name: 'amount', unit: 'minor units', description: 'The amount to split.' },
    { name: 'weights', unit: 'integer', description: 'Non-negative proportional weights.' },
  ],
  outputUnit: 'minor units',
  rounding:
    'Floor division, then the remainder is distributed one minor unit at a time to the ' +
    'largest weights first, ties broken by original index.',
  assumptions: [
    'Weights are non-negative and do not all equal zero.',
    'The distribution rule is deterministic, so the same input always yields the same split.',
  ],
  reference: 'Fowler, Patterns of Enterprise Application Architecture — Money pattern, allocation.',
  edgeCases: [
    'Negative amounts distribute the remainder in the negative direction.',
    'A remainder smaller than the number of parts leaves some parts without an extra unit.',
    'Zero total weight is rejected rather than producing a division by zero.',
  ],
  implementationPath: 'packages/financial-engine/src/money.ts#Money.allocate',
  testVectors: [
    {
      description: '100.00 USD split three ways conserves the total',
      inputs: { amount: '10000', weights: '1,1,1' },
      expected: '3334,3333,3333',
    },
    {
      description: '0.05 USD split 70/30',
      inputs: { amount: '5', weights: '70,30' },
      expected: '4,1',
    },
  ],
});

registerFormula({
  formulaId: 'money.divideRounded',
  version: 1,
  purpose:
    'Divide two exact integers, rounding the rational result according to an explicitly ' +
    'chosen mode. The primitive beneath every rate application.',
  inputs: [
    { name: 'dividend', unit: 'integer', description: 'Numerator.' },
    { name: 'divisor', unit: 'integer', description: 'Denominator, non-zero.' },
    {
      name: 'mode',
      unit: 'enum',
      description: 'HALF_UP | HALF_DOWN | HALF_EVEN | UP | DOWN | CEILING | FLOOR.',
    },
  ],
  outputUnit: 'integer',
  rounding: 'Caller-specified. There is deliberately no default mode.',
  assumptions: [
    'Half-way comparison is performed on doubled remainders, so it is exact.',
    'Sign is normalized before rounding, so negative behaviour is intentional per mode.',
  ],
  reference: 'IEEE 754 rounding attribute semantics, applied to exact integer arithmetic.',
  edgeCases: [
    'Exact division returns the quotient unchanged in every mode.',
    'HALF_EVEN at the half-way point rounds toward the even neighbour.',
    'Division by zero throws rather than returning Infinity.',
  ],
  implementationPath: 'packages/financial-engine/src/money.ts#divideRounded',
  testVectors: [
    {
      description: '5/2 HALF_UP',
      inputs: { dividend: '5', divisor: '2', mode: 'HALF_UP' },
      expected: '3',
    },
    {
      description: '5/2 HALF_EVEN',
      inputs: { dividend: '5', divisor: '2', mode: 'HALF_EVEN' },
      expected: '2',
    },
    {
      description: '7/2 HALF_EVEN',
      inputs: { dividend: '7', divisor: '2', mode: 'HALF_EVEN' },
      expected: '4',
    },
  ],
});
