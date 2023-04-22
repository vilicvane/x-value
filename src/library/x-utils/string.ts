import type {RefinedType} from '../core';
import {string} from '../types';
import {refinement} from '../utils';

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
