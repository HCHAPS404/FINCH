/**
 * PII redaction — README §31, AGENTS.md §4. Synthetic values only (Constitution §4.18).
 */
import { describe, expect, it } from 'vitest';

import { redactPii, restorePii } from './redaction.js';

describe('redactPii', () => {
  it('replaces emails with numbered placeholders', () => {
    const { text, replacements } = redactPii('Write to laura.demo@example.com or ops@example.co');
    expect(text).toBe('Write to <EMAIL_1> or <EMAIL_2>');
    expect(replacements.get('<EMAIL_1>')).toBe('laura.demo@example.com');
    expect(replacements.get('<EMAIL_2>')).toBe('ops@example.co');
  });

  it('replaces card, phone and account numbers, grouped or not', () => {
    const { text } = redactPii(
      'Card 4111 1111 1111 1111, phone 3001234567, account 0123-4567-8901',
    );
    expect(text).toBe('Card <NUMBER_1>, phone <NUMBER_2>, account <NUMBER_3>');
  });

  it('keeps amounts, rates and dates the user is asking about', () => {
    const input = 'I earn $4.200.000 on the 30th; my card charges 2,3 % MV since 2026-09-17.';
    expect(redactPii(input).text).toBe(input);
  });

  it('does not treat the digits inside an email as a number', () => {
    const { text, replacements } = redactPii('user3001234567@example.com');
    expect(text).toBe('<EMAIL_1>');
    expect(replacements.size).toBe(1);
  });

  it('returns the input untouched when there is nothing to redact', () => {
    const result = redactPii('Can I afford new headphones?');
    expect(result.text).toBe('Can I afford new headphones?');
    expect(result.replacements.size).toBe(0);
  });
});

describe('restorePii', () => {
  it('restores every occurrence for the same user', () => {
    const { text, replacements } = redactPii('Email me at laura.demo@example.com');
    const answer = `I will not email ${text.slice(12)}; <EMAIL_1> stays private.`;
    expect(restorePii(answer, replacements)).toBe(
      'I will not email laura.demo@example.com; laura.demo@example.com stays private.',
    );
  });
});

describe('redactPii boundaries', () => {
  it('does not cut a long number out of a decimal amount', () => {
    const input = 'Balance 12345678901,50 and 1.234.567.890.123';
    expect(redactPii(input).text).toBe(input);
  });

  it('redacts a number at the end of a sentence', () => {
    expect(redactPii('Call me at 3001234567.').text).toBe('Call me at <NUMBER_1>.');
  });
});
