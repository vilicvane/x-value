import {number} from '../atomics.js';
import type {RefinedType, TypeOf} from '../core/index.js';
import {refinement} from '../utils.js';

export const Integer = number.refined<'integer'>(
  value =>
    refinement(
      Number.isInteger(value),
      value,
      () => `Expected integer, got ${value}.`,
    ),
  {type: 'integer'},
);

export type Integer = TypeOf<typeof Integer>;

export type IntegerRangeOptions = {
  min?: number;
  max?: number;
};

export function integerRange<TNominalKey extends string | symbol = never>({
  min = -Infinity,
  max = Infinity,
}: IntegerRangeOptions): RefinedType<typeof Integer, TNominalKey, unknown> {
  return Integer.refined(
    value => {
      if (value < min) {
        throw `Expected integer >= ${min}, got ${value}.`;
      }

      if (value > max) {
        throw `Expected integer <= ${max}, got ${value}.`;
      }

      return value;
    },
    {
      ...(isFinite(min) && {minimum: min}),
      ...(isFinite(max) && {maximum: max}),
    },
  );
}

export type NumberRangeOptions = {
  minInclusive?: number;
  minExclusive?: number;
  maxInclusive?: number;
  maxExclusive?: number;
};

export function numberRange<TNominalKey extends string | symbol = never>({
  minInclusive = -Infinity,
  minExclusive = -Infinity,
  maxInclusive = Infinity,
  maxExclusive = Infinity,
}: NumberRangeOptions): RefinedType<typeof number, TNominalKey, unknown> {
  return number.refined(
    value => {
      if (value < minInclusive) {
        throw `Expected number >= ${minInclusive}, got ${value}.`;
      }

      if (value <= minExclusive) {
        throw `Expected number > ${minExclusive}, got ${value}.`;
      }

      if (value > maxInclusive) {
        throw `Expected number <= ${maxInclusive}, got ${value}.`;
      }

      if (value >= maxExclusive) {
        throw `Expected number < ${maxExclusive}, got ${value}.`;
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
