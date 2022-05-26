import isEqual from 'lodash.isequal';

import type {NominalPartial} from './@internal';
import type {TypeInMediumsPartial, TypeOf, __nominal, __type} from './type';
import {RefinedType, record} from './type';
import {boolean, number, string, unknown} from './types';

export const UnknownRecord = record(string, unknown);

export const Integer = number.refine<'integer'>(
  value => Number.isInteger(value) || `Expected integer, getting ${value}.`,
);

export interface IntegerRangeOptions {
  min?: number;
  max?: number;
}

export function integerRange<TNominalKey extends string | symbol>({
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

export function numberRange<TNominalKey extends string | symbol>({
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

export function literal<T extends string>(
  literal: T,
): RefinedType<typeof string, never, T>;
export function literal<T extends number>(
  literal: T,
): RefinedType<typeof number, never, T>;
export function literal<T extends boolean>(
  literal: T,
): RefinedType<typeof boolean, never, T>;
export function literal(
  literal: unknown,
): RefinedType<TypeInMediumsPartial, never, unknown> {
  switch (typeof literal) {
    case 'string':
      return string.refine(
        value =>
          value === literal ||
          `Expected string ${JSON.stringify(literal)}, getting ${
            typeof value === 'string' ? JSON.stringify(value) : value
          }.`,
      );
    case 'number':
      return number.refine(
        value =>
          value === literal ||
          `Expected number ${literal}, getting ${
            typeof value === 'string' ? JSON.stringify(value) : value
          }.`,
      );
    case 'boolean':
      return boolean.refine(
        value =>
          value === literal ||
          `Expected boolean ${literal}, getting ${
            typeof value === 'string' ? JSON.stringify(value) : value
          }.`,
      );
    default:
      throw new TypeError('Unsupported literal value');
  }
}

export function equal<T>(comparison: T): RefinedType<typeof unknown, never, T>;
export function equal<
  T extends TypeOf<TType>,
  TType extends TypeInMediumsPartial,
>(comparison: T, Type: TType): RefinedType<TType, never, T>;
export function equal(
  comparison: unknown,
  Type = unknown,
): RefinedType<TypeInMediumsPartial, never, unknown> {
  return new RefinedType(Type, [value => isEqual(value, comparison)]);
}

export type TransformNominal<TFrom, T> = TFrom extends NominalPartial
  ? T & Record<__type, T> & Record<__nominal, TFrom[__nominal]>
  : T;
