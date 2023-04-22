import type {RefinedType, TypeOf} from '../core';
import {number} from '../types';
import {refinement} from '../utils';

export const Integer = number.refined<'integer'>(
  value =>
    refinement(
      Number.isInteger(value),
      value,
      () => `Expected integer, getting ${value}.`,
    ),
  {type: 'integer'},
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
  return Integer.refined(
    value => {
      if (value < min) {
        throw `Expected integer >= ${min}, getting ${value}.`;
      }

      if (value > max) {
        throw `Expected integer <= ${max}, getting ${value}.`;
      }

      return value;
    },
    {
      ...(isFinite(min) && {minimum: min}),
      ...(isFinite(max) && {maximum: max}),
    },
  );
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
  return number.refined(
    value => {
      if (value < minInclusive) {
        throw `Expected number >= ${minInclusive}, getting ${value}.`;
      }

      if (value <= minExclusive) {
        throw `Expected number > ${minExclusive}, getting ${value}.`;
      }

      if (value > maxInclusive) {
        throw `Expected number <= ${maxInclusive}, getting ${value}.`;
      }

      if (value >= maxExclusive) {
        throw `Expected number < ${maxExclusive}, getting ${value}.`;
      }

      return value;
    },
    {
      ...(isFinite(minInclusive) && {minimum: minInclusive}),
      ...(isFinite(minExclusive) && {exclusiveMinimum: minExclusive}),
      ...(isFinite(maxInclusive) && {maximum: maxInclusive}),
      ...(isFinite(maxExclusive) && {exclusiveMaximum: maxExclusive}),
    },
  );
}
