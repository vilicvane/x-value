import {booleanTypeSymbol, numberTypeSymbol, stringTypeSymbol} from '../types';

import {AtomicType} from './atomic-type';

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
