/**
 * FINCH ESLint plugin — executable clauses of the Architecture Constitution.
 * Each rule cites the README section it enforces. Adding or relaxing a rule is an
 * architecture change and requires an ADR (README §76).
 */
import noFloatMoney from './rules/no-float-money.js';
import noPiiAnalytics from './rules/no-pii-analytics.js';

export default {
  meta: { name: '@finch/eslint-plugin', version: '0.0.0' },
  rules: {
    'no-float-money': noFloatMoney,
    'no-pii-analytics': noPiiAnalytics,
  },
};
