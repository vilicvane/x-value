import type {RefinedType, TypeOf} from '../type';
import {number} from '../types';

export const Integer = number.refine<'integer'>(
  value => Number.isInteger(value) || `Expected integer, getting ${value}.`,
);

export type Integer = TypeOf<typeof Integer>;

export interface IntegerRangeOptions {
  min?: number;
  max?: number;
}

export function integerRange<TNominalKey extends string | symbol = never>({
  min = -Infinity,
  max = Infinity,
}: IntegerRangeOptions): RefinedType<typeof Integer, TNominalKey, unknown> {
  return Integer.refine(value => {
    if (value < min) {
      return `Expected integer >= ${min}, getting ${value}.`;
    }

    if (value > max) {
      return `Expected integer <= ${max}, getting ${value}.`;
    }

    return true;
  });
}

export interface NumberRangeOptions {
  minInclusive?: number;
  minExclusive?: number;
  maxInclusive?: number;
  maxExclusive?: number;
}

export function numberRange<TNominalKey extends string | symbol = never>({
  minInclusive = -Infinity,
  minExclusive = -Infinity,
  maxInclusive = Infinity,
  maxExclusive = Infinity,
}: NumberRangeOptions): RefinedType<typeof number, TNominalKey, unknown> {
  return number.refine(value => {
    if (value < minInclusive) {
      return `Expected number >= ${minInclusive}, getting ${value}.`;
    }

    if (value <= minExclusive) {
      return `Expected number > ${minExclusive}, getting ${value}.`;
    }

    if (value > maxInclusive) {
      return `Expected number <= ${maxInclusive}, getting ${value}.`;
    }

    if (value >= maxExclusive) {
      return `Expected number < ${maxExclusive}, getting ${value}.`;
    }

    return true;
  });
}
