import isEqual from 'lodash.isequal';

import type {__NominalPartial} from './@internal';
import type {Type, TypeOf, __nominal, __type} from './type';
import {RefinedType, record} from './type';
import {boolean, number, string, unknown} from './types';

export const UnknownRecord = record(string, unknown);

export function literal<T extends string>(
  literal: T,
): RefinedType<typeof string, T, unknown>;
export function literal<T extends number>(
  literal: T,
): RefinedType<typeof number, T, unknown>;
export function literal<T extends boolean>(
  literal: T,
): RefinedType<typeof boolean, T, unknown>;
export function literal(literal: unknown): RefinedType<Type, unknown, unknown> {
  switch (typeof literal) {
    case 'string':
      return string.refine(value => value === literal);
    case 'number':
      return number.refine(value => value === literal);
    case 'boolean':
      return boolean.refine(value => value === literal);
    default:
      throw new TypeError('Unsupported literal value');
  }
}

export function equal<T>(
  comparison: T,
): RefinedType<typeof unknown, T, unknown>;
export function equal<T extends TypeOf<TType>, TType extends Type>(
  comparison: T,
  Type: TType,
): RefinedType<TType, T, unknown>;
export function equal(
  comparison: unknown,
  Type = unknown,
): RefinedType<Type, unknown, unknown> {
  return new RefinedType(Type, [value => isEqual(value, comparison)]);
}

export type TransformNominal<TFrom, T> = TFrom extends __NominalPartial
  ? T & Record<__type, T> & Record<__nominal, TFrom[__nominal]>
  : T;
