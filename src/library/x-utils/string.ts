import {string} from '../atomics.js';
import type {RefinedType} from '../core/index.js';
import {refinement} from '../utils.js';

export function pattern<
  TNominalKey extends string | symbol = never,
  TRefinement = unknown,
>(
  pattern: RegExp,
  message?: string | (() => string),
): RefinedType<typeof string, TNominalKey, TRefinement> {
  return string.refined(value =>
    refinement(pattern.test(value), value, message),
  );
}
