import isEqual from 'lodash.isequal';

import {AtomicType} from './type';
import {
  booleanTypeSymbol,
  numberTypeSymbol,
  stringTypeSymbol,
  unknownTypeSymbol,
} from './types';

export function literal<TType extends string>(
  literal: TType,
): AtomicType<TType, typeof stringTypeSymbol>;
export function literal<TType extends number>(
  literal: TType,
): AtomicType<TType, typeof numberTypeSymbol>;
export function literal<TType extends boolean>(
  literal: TType,
): AtomicType<TType, typeof booleanTypeSymbol>;
export function literal<TType extends string | number | boolean>(
  literal: TType,
): AtomicType<TType> {
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

export function equal<TType>(object: TType): AtomicType<TType> {
  return new AtomicType(unknownTypeSymbol, [value => value === object]);
}

export function deepEqual<TType>(object: TType): AtomicType<TType> {
  return new AtomicType(unknownTypeSymbol, [value => isEqual(value, object)]);
}
