import isEqual from 'lodash.isequal';

import type {Type, TypeOf} from './type';
import {AtomicType, RefinedType, record} from './type';
import {
  booleanTypeSymbol,
  numberTypeSymbol,
  string,
  stringTypeSymbol,
  unknown,
} from './types';

/**
 * DECLARATION ONLY.
 *
 * Exported to avoid TS4023 error:
 * https://github.com/Microsoft/TypeScript/issues/5711
 */
export declare const __nominal: unique symbol;

/**
 * DECLARATION ONLY.
 *
 * Exported to avoid TS4023 error:
 * https://github.com/Microsoft/TypeScript/issues/5711
 */
export declare const __nominalType: unique symbol;

export type Nominal<TNominal, T = unknown> = T &
  (unknown extends TNominal
    ? unknown
    : {
        [TNominalTypeSymbol in typeof __nominalType]: T;
      } & ([TNominal] extends [string | symbol]
        ? {
            [TNominalSymbol in typeof __nominal]: {
              [TNominalKey in TNominal]: true;
            };
          }
        : TNominal));

export type Denominalize<T> = T extends {
  [TNominalTypeSymbol in typeof __nominalType]: infer TDenominalized;
}
  ? TDenominalized
  : T;

export const UnknownRecord = record(string, unknown);

export function literal<T extends string>(
  literal: T,
): AtomicType<typeof stringTypeSymbol>;
export function literal<T extends number>(
  literal: T,
): AtomicType<typeof numberTypeSymbol>;
export function literal<T extends boolean>(
  literal: T,
): AtomicType<typeof booleanTypeSymbol>;
export function literal(literal: unknown): AtomicType<any> {
  let symbol: symbol;

  switch (typeof literal) {
    case 'string':
      symbol = stringTypeSymbol;
      break;
    case 'number':
      symbol = numberTypeSymbol;
      break;
    case 'boolean':
      symbol = booleanTypeSymbol;
      break;
    default:
      throw new TypeError('Unsupported literal value');
  }

  return new AtomicType(symbol, [value => value === literal]);
}

export function equal(
  comparison: unknown,
): RefinedType<typeof unknown, unknown>;
export function equal<TType extends Type>(
  comparison: TypeOf<TType>,
  Type: TType,
): RefinedType<TType, unknown>;
export function equal(
  comparison: unknown,
  Type = unknown,
): RefinedType<Type, unknown> {
  return new RefinedType(Type, [value => isEqual(value, comparison)]);
}
