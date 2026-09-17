/**
 * FINCH rule: no-pii-analytics
 *
 * README §53 (Product Analytics) and §64 — product analytics events must never carry
 * raw balances, account numbers, transaction descriptions, official IDs, document
 * contents or tokens. §54 keeps domain/audit/telemetry/product-analytics events
 * distinct precisely because their sensitivity and retention differ.
 *
 * This rule enforces a property denylist on analytics call sites so a leak is caught
 * in CI rather than discovered in a vendor dashboard.
 */

const ANALYTICS_METHODS = new Set(['track', 'capture', 'identify', 'group', 'screen', 'page']);

const FORBIDDEN_PROPERTY = new RegExp(
  [
    'balance',
    'account_?number',
    'accountnumber',
    'iban',
    'clabe',
    'card_?number',
    'cardnumber',
    'pan\\b',
    'cvv',
    'cvc',
    'expiry',
    'transaction_?description',
    'description_?raw',
    'raw_?payload',
    'document_?content',
    'document_?text',
    'ocr_?text',
    'national_?id',
    'cedula',
    'nit\\b',
    'passport',
    'tax_?id',
    'ssn',
    'token',
    'access_?token',
    'refresh_?token',
    'api_?key',
    'password',
    'secret',
    'email',
    'phone',
    'full_?name',
    'address',
    'dob',
    'birth',
  ].join('|'),
  'i',
);

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Forbid PII and raw financial values as product-analytics event properties.',
      recommended: true,
    },
    schema: [],
    messages: {
      forbiddenProperty:
        "Analytics property '{{name}}' is on the FINCH denylist (README §53). Product " +
        'analytics must not carry balances, account numbers, raw descriptions, official ' +
        'IDs, document contents or tokens. Send a pseudonymous identifier or a bucketed ' +
        'value instead, and record the sensitive fact as an audit event (§54).',
      spreadNotAllowed:
        'Spreading an object into an analytics payload defeats the property allowlist ' +
        '(README §53). Enumerate the properties explicitly so CI can verify them.',
    },
  },

  create(context) {
    function checkPayload(node) {
      if (!node || node.type !== 'ObjectExpression') return;
      for (const prop of node.properties) {
        if (prop.type === 'SpreadElement') {
          context.report({ node: prop, messageId: 'spreadNotAllowed' });
          continue;
        }
        const name = prop.key?.name ?? prop.key?.value;
        if (typeof name === 'string' && FORBIDDEN_PROPERTY.test(name)) {
          context.report({ node: prop, messageId: 'forbiddenProperty', data: { name } });
        }
      }
    }

    return {
      CallExpression(node) {
        const { callee } = node;
        if (callee.type !== 'MemberExpression') return;
        const method = callee.property?.name;
        if (!ANALYTICS_METHODS.has(method)) return;

        const objectName =
          callee.object.type === 'Identifier' ? callee.object.name.toLowerCase() : '';
        const looksAnalytics =
          /analytics|posthog|telemetry|tracker|metrics/.test(objectName) ||
          callee.object.type === 'MemberExpression';
        if (!looksAnalytics) return;

        for (const arg of node.arguments) {
          checkPayload(arg);
        }
      },
    };
  },
};
