import isEqual from 'lodash.isequal';

import type {NominalPartial} from '../@internal';
import type {TypeInMediumsPartial, TypeOf, __nominal, __type} from '../type';
import {RefinedType, record} from '../type';
import {boolean, number, string, unknown} from '../types';
import {refinement} from '../utils';

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
): RefinedType<TypeInMediumsPartial, never, unknown> {
  switch (typeof literal) {
    case 'string':
      return string.refine(value =>
        refinement(
          value === literal,
          value,
          () =>
            `Expected string ${JSON.stringify(
              literal,
            )}, getting ${JSON.stringify(value)}.`,
        ),
      );
    case 'number':
      return number.refine(value =>
        refinement(
          value === literal,
          value,
          () => `Expected number ${literal}, getting ${value}.`,
        ),
      );
    case 'boolean':
      return boolean.refine(value =>
        refinement(
          value === literal,
          value,
          () => `Expected boolean ${literal}, getting ${value}.`,
        ),
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
  return new RefinedType(Type, [
    value => refinement(isEqual(value, comparison), value),
  ]);
}

export const UnknownRecord = record(string, unknown);

export type UnknownRecord = TypeOf<typeof UnknownRecord>;