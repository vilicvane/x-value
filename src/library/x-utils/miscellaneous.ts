import isEqual from 'lodash.isequal';

import {boolean, number, string, unknown} from '../atomics.js';
import type {
  NominalPartial,
  RefinedType,
  Type,
  TypeInMediumsPartial,
  TypeOf,
  __nominal,
  __type,
} from '../core/index.js';
import {record} from '../core/index.js';
import {refinement} from '../utils.js';

export type TransformNominal<TFrom, T> = TFrom extends NominalPartial
  ? T & Record<__type, T> & Record<__nominal, TFrom[__nominal]>
  : T;

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
): RefinedType<TypeInMediumsPartial, never, unknown, true> {
  switch (typeof literal) {
    case 'string':
      return string.refined(
        value =>
          refinement(
            value === literal,
            value,
            () =>
              `Expected string ${JSON.stringify(literal)}, got ${JSON.stringify(
                value,
              )}.`,
          ),
        {const: literal},
      );
    case 'number':
      return number.refined(
        value =>
          refinement(
            value === literal,
            value,
            () => `Expected number ${literal}, got ${value}.`,
          ),
        {const: literal},
      );
    case 'boolean':
      return boolean.refined(
        value =>
          refinement(
            value === literal,
            value,
            () => `Expected boolean ${literal}, got ${value}.`,
          ),
        {const: literal},
      );
    default:
      throw new TypeError('Unsupported literal value.');
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
  return Type.refined(value =>
    refinement(isEqual(value, comparison), value, 'Expected equal values.'),
  );
}

export const UnknownRecord = record(string, unknown);

export type UnknownRecord = TypeOf<typeof UnknownRecord>;

export function Promise<TType extends TypeInMediumsPartial>(
  Type: TType,
): RefinedType<typeof unknown, never, Promise<TypeOf<TType>>>;
export function Promise(
  Type: Type,
): RefinedType<TypeInMediumsPartial, never, Promise<unknown>> {
  return unknown.refined(value =>
    refinement(
      value instanceof globalThis.Promise,
      () =>
        (value as Promise<unknown>).then(fulfilled =>
          Type.satisfies(fulfilled),
        ),
      'Expected a Promise.',
    ),
  );
}
