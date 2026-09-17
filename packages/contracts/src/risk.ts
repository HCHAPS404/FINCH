/**
 * Feature risk tiers — README §18, §74.
 *
 * The tier decides which gates a change must clear before it ships. Encoding it as a
 * type means a feature cannot quietly drift from "show a number" to "move money"
 * without the escalation being visible in code review.
 */

export const RISK_TIERS = ['R0', 'R1', 'R2', 'R3', 'R4'] as const;
export type RiskTier = (typeof RISK_TIERS)[number];

export const RISK_TIER_DESCRIPTION: Readonly<Record<RiskTier, string>> = {
  R0: 'Information: visualization, education, editable categorization.',
  R1: 'Financial intelligence: forecast, comparison, safe-to-spend, opportunity.',
  R2: 'External non-monetary action: quote request, deep link, form submission.',
  R3: 'Money movement: payment initiation, transfer, autopay.',
  R4: 'Custody / ledger-critical. Not in v1 (Constitution, README §18).',
};

/**
 * Regulatory capability class — README §37.
 *
 * Separate from risk tier: risk is about blast radius, capability is about what kind
 * of regulated activity the software is performing. A feature can be low-risk and
 * still cross a regulatory line.
 */
export const CAPABILITY_CLASSES = [
  'INFORMATION',
  'COMPARISON',
  'SIMULATION',
  'PERSONALIZED_RECOMMENDATION',
  'EXTERNAL_ACTION',
  'PAYMENT_INITIATION',
  'MONEY_MOVEMENT',
  'CUSTODY',
] as const;

export type CapabilityClass = (typeof CAPABILITY_CLASSES)[number];

/** Data sensitivity classes used by the AI Gateway policy — README §31. */
export const DATA_CLASSIFICATIONS = [
  'PUBLIC',
  'INTERNAL',
  'CONFIDENTIAL',
  'RESTRICTED_FINANCIAL',
  'RESTRICTED_IDENTITY',
] as const;

export type DataClassification = (typeof DATA_CLASSIFICATIONS)[number];
