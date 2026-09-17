/**
 * FINCH rule: no-float-money
 *
 * Constitution §4.3 — "Money jamas usa floating point binario como representacion
 * financiera autoritativa." README §14.1 and §64.
 *
 * Binary floating point cannot represent decimal currency exactly. A single
 * `number` in a money position is a silent correctness defect that survives every
 * happy-path test and surfaces as a wrong balance in production.
 *
 * This rule flags:
 *   - type annotations that declare a money-ish identifier as `number`
 *   - arithmetic on identifiers whose names denote money
 *   - parseFloat/Number() applied to money-ish identifiers
 *
 * Correct representations: bigint minor units (settled amounts) or the arbitrary
 * precision decimal type exposed by @finch/financial-engine (rates/intermediates).
 */

const MONEY_NAME =
  /(^|[._])(amount|balance|price|cost|fee|interest|principal|payment|total|subtotal|installment|cuota|saldo|monto|valor|premium|payout|debt|credit|debit)([._A-Z]|$)/i;

/** Names that look money-ish but are counts, not currency. */
const ALLOWED =
  /(count|qty|quantity|index|length|ratio|percent|pct|rate_bp|basis_points|days|months|years|periods|term)/i;

function isMoneyName(name) {
  return typeof name === 'string' && MONEY_NAME.test(name) && !ALLOWED.test(name);
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Forbid binary floating point (`number`) as an authoritative representation of money.',
      recommended: true,
    },
    schema: [],
    messages: {
      floatMoney:
        "'{{name}}' denotes money but is typed as `number`. Binary floating point is not an " +
        'authoritative money representation (README Constitution §4.3, §14.1). Use `bigint` ' +
        'minor units for settled amounts, or the Decimal type from @finch/financial-engine ' +
        'for rates and intermediate calculations.',
      floatMoneyCoercion:
        "'{{name}}' denotes money; `{{callee}}()` produces a binary float. Parse into `bigint` " +
        'minor units or a Decimal instead (README §14.1).',
    },
  },

  create(context) {
    /** Report `x: number` where x is money-ish. */
    function checkAnnotated(node, name) {
      const annotation = node.typeAnnotation?.typeAnnotation;
      if (!annotation) return;
      if (annotation.type !== 'TSNumberKeyword') return;
      if (!isMoneyName(name)) return;
      context.report({ node, messageId: 'floatMoney', data: { name } });
    }

    return {
      Identifier(node) {
        if (!node.typeAnnotation) return;
        checkAnnotated(node, node.name);
      },

      TSPropertySignature(node) {
        const name = node.key?.name ?? node.key?.value;
        checkAnnotated(node, name);
      },

      PropertyDefinition(node) {
        const name = node.key?.name ?? node.key?.value;
        checkAnnotated(node, name);
      },

      CallExpression(node) {
        const calleeName = node.callee.type === 'Identifier' ? node.callee.name : undefined;
        if (calleeName !== 'parseFloat' && calleeName !== 'Number') return;
        const arg = node.arguments[0];
        const argName =
          arg?.type === 'Identifier'
            ? arg.name
            : arg?.type === 'MemberExpression' && arg.property?.type === 'Identifier'
              ? arg.property.name
              : undefined;
        if (!isMoneyName(argName)) return;
        context.report({
          node,
          messageId: 'floatMoneyCoercion',
          data: { name: argName, callee: calleeName },
        });
      },
    };
  },
};
