/**
 * Test-only loader for the independent golden vectors in `packages/financial-engine/test/vectors`.
 *
 * The JSON files are produced by `test/vectors/generate_credit_vectors.py`, a separate Python
 * implementation of the formula specs. Tests compare the engine against them; the engine
 * never generates its own expected values (financial-formula skill: "never take expected
 * values from your own output").
 */
import { readFileSync } from 'node:fs';

export interface VectorFile<TInputs, TExpected> {
  readonly formulaId: string;
  readonly version: number;
  readonly verifiedBy: readonly string[];
  readonly vectors: readonly {
    readonly description: string;
    readonly inputs: TInputs;
    readonly expected: TExpected;
  }[];
}

export function loadVectors<TInputs, TExpected>(fileName: string): VectorFile<TInputs, TExpected> {
  const url = new URL(`./vectors/${fileName}`, import.meta.url);
  return JSON.parse(readFileSync(url, 'utf8')) as VectorFile<TInputs, TExpected>;
}
