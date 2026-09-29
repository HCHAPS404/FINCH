/**
 * Synthetic demo personas — Constitution §4.18, README §80, docs/hackathon/02 §3.
 *
 * Everything here is invented: names, institutions ("Demo Bank A"), balances and
 * masked numbers. No real person, bank or card is represented. IDs are fixed so the
 * seed is idempotent and tests can refer to specific rows.
 *
 * Amounts are bigint minor units (COP and USD both have ISO exponent 2).
 * The second-country persona (Sofía, G4) waits for decision D-11.
 */

/** Deterministic, valid RFC 4122 v4-shaped IDs in a recognizable `5eed` namespace. */
export function seedId(n: number): string {
  return `5eed0000-0000-4000-8000-${n.toString().padStart(12, '0')}`;
}

const COP = (pesos: bigint, centavos = 0n): bigint => pesos * 100n + centavos;
const USD = (dollars: bigint, cents = 0n): bigint => dollars * 100n + cents;

const assert = (persona: string) =>
  ({
    truthClass: 'USER_ASSERTED',
    sourceType: 'USER_INPUT',
    sourceRef: `seed:persona/${persona}@1`,
  }) as const;

const imported = (persona: string) =>
  ({
    truthClass: 'USER_ASSERTED',
    sourceType: 'IMPORT',
    sourceRef: `seed:statement/${persona}@1`,
  }) as const;

const estimated = (persona: string) =>
  ({
    truthClass: 'ESTIMATED',
    sourceType: 'COMPUTATION',
    sourceRef: `seed:persona/${persona}@1#p25`,
  }) as const;

export const IDS = {
  laura: {
    principal: seedId(101),
    party: seedId(102),
    workspace: seedId(103),
    savings: seedId(110),
    cardA: seedId(111),
    cardB: seedId(112),
    loan: seedId(113),
  },
  andres: {
    principal: seedId(201),
    party: seedId(202),
    workspace: seedId(203),
    savingsCop: seedId(210),
    accountUsd: seedId(211),
  },
  perez: {
    camilaPrincipal: seedId(301),
    julianPrincipal: seedId(302),
    camilaParty: seedId(303),
    julianParty: seedId(304),
    workspace: seedId(305),
    joint: seedId(310),
    camilaCard: seedId(311),
  },
} as const;

const L = IDS.laura;
const A = IDS.andres;
const P = IDS.perez;

export const PERSONAS = {
  principals: [
    { id: L.principal, type: 'HUMAN', displayName: 'Laura (demo)' },
    { id: A.principal, type: 'HUMAN', displayName: 'Andrés (demo)' },
    { id: P.camilaPrincipal, type: 'HUMAN', displayName: 'Camila Pérez (demo)' },
    { id: P.julianPrincipal, type: 'HUMAN', displayName: 'Julián Pérez (demo)' },
  ],
  parties: [
    { id: L.party, type: 'PERSON', displayName: 'Laura (demo)' },
    { id: A.party, type: 'PERSON', displayName: 'Andrés (demo)' },
    { id: P.camilaParty, type: 'PERSON', displayName: 'Camila Pérez (demo)' },
    { id: P.julianParty, type: 'PERSON', displayName: 'Julián Pérez (demo)' },
  ],
  workspaces: [
    {
      id: L.workspace,
      type: 'PERSONAL',
      name: 'Laura · Medellín',
      baseCurrency: 'COP',
      locale: 'es-CO',
      timezone: 'America/Bogota',
    },
    {
      id: A.workspace,
      type: 'PERSONAL',
      name: 'Andrés · Bogotá',
      baseCurrency: 'COP',
      locale: 'es-CO',
      timezone: 'America/Bogota',
    },
    {
      id: P.workspace,
      type: 'HOUSEHOLD',
      name: 'Pérez household',
      baseCurrency: 'COP',
      locale: 'es-CO',
      timezone: 'America/Bogota',
    },
  ],
  workspaceParties: [
    { workspaceId: L.workspace, partyId: L.party },
    { workspaceId: A.workspace, partyId: A.party },
    { workspaceId: P.workspace, partyId: P.camilaParty },
    { workspaceId: P.workspace, partyId: P.julianParty },
  ],
  memberships: [
    { id: seedId(151), workspaceId: L.workspace, principalId: L.principal, role: 'OWNER' },
    { id: seedId(251), workspaceId: A.workspace, principalId: A.principal, role: 'OWNER' },
    { id: seedId(351), workspaceId: P.workspace, principalId: P.camilaPrincipal, role: 'OWNER' },
    { id: seedId(352), workspaceId: P.workspace, principalId: P.julianPrincipal, role: 'OWNER' },
  ],
  /**
   * Household sharing: Julián can read the joint account. Camila's personal card has no
   * grant for him — the negative authorization case S3-03 must prove.
   */
  grants: [
    {
      id: seedId(361),
      workspaceId: P.workspace,
      principalId: P.julianPrincipal,
      resourceType: 'account',
      resourceId: P.joint,
      action: 'account.read',
      grantedByPrincipalId: P.camilaPrincipal,
    },
    {
      id: seedId(362),
      workspaceId: P.workspace,
      principalId: P.camilaPrincipal,
      resourceType: 'account',
      resourceId: P.joint,
      action: 'account.read',
      grantedByPrincipalId: P.julianPrincipal,
    },
  ],
  accounts: [
    {
      id: L.savings,
      workspaceId: L.workspace,
      ownerPartyId: L.party,
      kind: 'SAVINGS',
      name: 'Payroll savings',
      institutionName: 'Demo Bank A',
      currency: 'COP',
      maskedNumber: '4821',
      ...assert('laura'),
    },
    {
      id: L.cardA,
      workspaceId: L.workspace,
      ownerPartyId: L.party,
      kind: 'CREDIT_CARD',
      name: 'Card A',
      institutionName: 'Demo Bank A',
      currency: 'COP',
      maskedNumber: '7310',
      ...assert('laura'),
    },
    {
      id: L.cardB,
      workspaceId: L.workspace,
      ownerPartyId: L.party,
      kind: 'CREDIT_CARD',
      name: 'Card B',
      institutionName: 'Demo Bank B',
      currency: 'COP',
      maskedNumber: '0592',
      ...assert('laura'),
    },
    {
      id: L.loan,
      workspaceId: L.workspace,
      ownerPartyId: L.party,
      kind: 'LOAN',
      name: 'Personal loan',
      institutionName: 'Demo Bank B',
      currency: 'COP',
      maskedNumber: null,
      ...assert('laura'),
    },
    {
      id: A.savingsCop,
      workspaceId: A.workspace,
      ownerPartyId: A.party,
      kind: 'SAVINGS',
      name: 'Savings (COP)',
      institutionName: 'Demo Bank C',
      currency: 'COP',
      maskedNumber: '1177',
      ...assert('andres'),
    },
    {
      id: A.accountUsd,
      workspaceId: A.workspace,
      ownerPartyId: A.party,
      kind: 'CHECKING',
      name: 'USD account',
      institutionName: 'Demo Neobank',
      currency: 'USD',
      maskedNumber: '9046',
      ...assert('andres'),
    },
    {
      id: P.joint,
      workspaceId: P.workspace,
      ownerPartyId: null,
      kind: 'CHECKING',
      name: 'Joint account',
      institutionName: 'Demo Bank A',
      currency: 'COP',
      maskedNumber: '3358',
      ...assert('perez'),
    },
    {
      id: P.camilaCard,
      workspaceId: P.workspace,
      ownerPartyId: P.camilaParty,
      kind: 'CREDIT_CARD',
      name: "Camila's card",
      institutionName: 'Demo Bank C',
      currency: 'COP',
      maskedNumber: '6604',
      ...assert('perez'),
    },
  ],
  balanceObservations: [
    {
      id: seedId(120),
      workspaceId: L.workspace,
      accountId: L.savings,
      amountMinor: COP(1_850_000n),
      currency: 'COP',
      observedAt: new Date('2026-09-28T12:00:00Z'),
      ...assert('laura'),
    },
    {
      id: seedId(220),
      workspaceId: A.workspace,
      accountId: A.accountUsd,
      amountMinor: USD(2_340n, 50n),
      currency: 'USD',
      observedAt: new Date('2026-09-28T12:00:00Z'),
      ...assert('andres'),
    },
  ],
  creditCards: [
    {
      accountId: L.cardA,
      workspaceId: L.workspace,
      creditLimitMinor: COP(8_000_000n),
      currency: 'COP',
      cutoffDay: 15,
      paymentDay: 5,
      rateValue: '2.300000',
      rateConvention: 'MV',
      handlingFeeMinor: COP(38_900n),
      ...assert('laura'),
    },
    {
      accountId: L.cardB,
      workspaceId: L.workspace,
      creditLimitMinor: COP(3_000_000n),
      currency: 'COP',
      cutoffDay: 25,
      paymentDay: 15,
      rateValue: '1.900000',
      rateConvention: 'MV',
      handlingFeeMinor: COP(24_500n),
      ...assert('laura'),
    },
    {
      accountId: P.camilaCard,
      workspaceId: P.workspace,
      creditLimitMinor: COP(5_000_000n),
      currency: 'COP',
      cutoffDay: 20,
      paymentDay: 10,
      rateValue: '1.950000',
      rateConvention: 'MV',
      handlingFeeMinor: COP(29_900n),
      ...assert('perez'),
    },
  ],
  loans: [
    {
      // COP 10,000,000 at 1.6 % MV over 36 months: French instalment 367,572.18
      // (docs/financial-formulas/colombia-credit.md §2; verified independently).
      accountId: L.loan,
      workspaceId: L.workspace,
      principalMinor: COP(10_000_000n),
      outstandingMinor: COP(6_128_450n),
      instalmentMinor: COP(367_572n, 18n),
      currency: 'COP',
      rateValue: '1.600000',
      rateConvention: 'MV',
      termMonths: 36,
      remainingInstalments: 19,
      paymentDay: 8,
      insuranceBasis: 'OUTSTANDING',
      insuranceRateValue: '0.090000',
      ...assert('laura'),
    },
  ],
  incomeStreams: [
    {
      id: seedId(130),
      workspaceId: L.workspace,
      partyId: L.party,
      name: 'Salary',
      kind: 'SALARY',
      amountMinor: COP(4_200_000n),
      currency: 'COP',
      cadence: 'MONTHLY',
      expectedDay: 30,
      variable: false,
      ...assert('laura'),
    },
    {
      id: seedId(230),
      workspaceId: A.workspace,
      partyId: A.party,
      name: 'Foreign clients (USD)',
      kind: 'FEES',
      amountMinor: USD(1_450n),
      currency: 'USD',
      cadence: 'MONTHLY',
      expectedDay: null,
      variable: true,
      ...estimated('andres'),
    },
    {
      id: seedId(231),
      workspaceId: A.workspace,
      partyId: A.party,
      name: 'Local clients (COP)',
      kind: 'FEES',
      amountMinor: COP(2_100_000n),
      currency: 'COP',
      cadence: 'MONTHLY',
      expectedDay: null,
      variable: true,
      ...estimated('andres'),
    },
    {
      id: seedId(330),
      workspaceId: P.workspace,
      partyId: P.camilaParty,
      name: 'Camila salary',
      kind: 'SALARY',
      amountMinor: COP(5_600_000n),
      currency: 'COP',
      cadence: 'MONTHLY',
      expectedDay: 30,
      variable: false,
      ...assert('perez'),
    },
    {
      id: seedId(331),
      workspaceId: P.workspace,
      partyId: P.julianParty,
      name: 'Julián salary',
      kind: 'SALARY',
      amountMinor: COP(3_900_000n),
      currency: 'COP',
      cadence: 'SEMIMONTHLY',
      expectedDay: 15,
      variable: false,
      ...assert('perez'),
    },
  ],
  obligations: [
    ['laura', L.workspace, 140, 'Rent', 'housing', COP(1_300_000n), 5, true],
    ['laura', L.workspace, 141, 'Utilities', 'housing', COP(280_000n), 12, true],
    ['laura', L.workspace, 142, 'Mobile plan', 'telecom', COP(65_000n), 18, true],
    ['laura', L.workspace, 143, 'Gym', 'health', COP(120_000n), 1, false],
    ['laura', L.workspace, 144, 'Video streaming', 'subscriptions', COP(44_900n), 22, false],
    ['laura', L.workspace, 145, 'Music streaming', 'subscriptions', COP(26_900n), 9, false],
    ['andres', A.workspace, 240, 'Rent', 'housing', COP(1_600_000n), 1, true],
    [
      'andres',
      A.workspace,
      241,
      'Health contributions',
      'social-security',
      COP(450_000n),
      10,
      true,
    ],
    ['perez', P.workspace, 340, 'Rent', 'housing', COP(2_400_000n), 3, true],
    ['perez', P.workspace, 341, 'Groceries', 'food', COP(1_500_000n), 1, true],
  ].map(([persona, workspaceId, n, name, category, amountMinor, dueDay, essential]) => ({
    id: seedId(n as number),
    workspaceId: workspaceId as string,
    name: name as string,
    category: category as string,
    amountMinor: amountMinor as bigint,
    currency: 'COP',
    cadence: 'MONTHLY' as const,
    dueDay: dueDay as number,
    essential: essential as boolean,
    ...assert(persona as string),
  })),
  transactions: [
    ['2026-08-30', L.savings, COP(4_200_000n), 'PAYROLL DEMO EMPLOYER', 'Demo Employer', 'income'],
    ['2026-09-05', L.savings, -COP(1_300_000n), 'RENT TRANSFER', 'Landlord', 'housing'],
    ['2026-09-09', L.cardA, -COP(26_900n), 'MUSICSTREAM *MONTHLY', 'MusicStream', 'subscriptions'],
    ['2026-09-22', L.cardA, -COP(44_900n), 'VIDEOSTREAM.COM', 'VideoStream', 'subscriptions'],
    ['2026-08-22', L.cardA, -COP(39_900n), 'VIDEOSTREAM.COM', 'VideoStream', 'subscriptions'],
    ['2026-09-14', L.cardA, -COP(189_000n), 'SUPERMARKET 104', 'Supermarket', 'groceries'],
    ['2026-09-14', L.cardA, -COP(189_000n), 'SUPERMARKET 104', 'Supermarket', 'groceries'],
    ['2026-09-01', L.cardB, -COP(120_000n), 'GYM MEMBERSHIP', 'Gym', 'health'],
  ].map(([bookedOn, accountId, amountMinor, description, merchant, category], index) => ({
    id: seedId(160 + index),
    workspaceId: L.workspace,
    accountId: accountId as string,
    amountMinor: amountMinor as bigint,
    currency: 'COP',
    bookedOn: bookedOn as string,
    description: description as string,
    merchantNormalized: merchant as string,
    category: category as string,
    status: 'POSTED' as const,
    // Unique per statement line, so the planted duplicate supermarket charge survives.
    dedupeKey: `seed:laura:line:${String(index + 1)}`,
    ...imported('laura'),
  })),
  goals: [
    {
      id: seedId(170),
      workspaceId: L.workspace,
      name: 'Emergency fund',
      targetMinor: COP(12_600_000n),
      currency: 'COP',
      targetDate: '2027-06-30',
      priority: 1,
      shared: false,
    },
    {
      id: seedId(171),
      workspaceId: L.workspace,
      name: 'December trip',
      targetMinor: COP(3_500_000n),
      currency: 'COP',
      targetDate: '2026-12-15',
      priority: 3,
      shared: false,
    },
    {
      id: seedId(370),
      workspaceId: P.workspace,
      name: 'Home down payment',
      targetMinor: COP(60_000_000n),
      currency: 'COP',
      targetDate: '2028-12-31',
      priority: 1,
      shared: true,
    },
  ],
} as const;
