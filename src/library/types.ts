import {toString} from './@utils';
import {atomic} from './type';

declare global {
  namespace XValue {
    interface Types {
      [unknownTypeSymbol]: unknown;
      [undefinedTypeSymbol]: undefined;
      [voidTypeSymbol]: void;
      [nullTypeSymbol]: null;
      [stringTypeSymbol]: string;
      [numberTypeSymbol]: number;
      [booleanTypeSymbol]: boolean;
      [dateTypeSymbol]: Date;
      [regexpTypeSymbol]: RegExp;
    }
  }
}

export const unknownTypeSymbol = Symbol();
export const unknown = atomic(unknownTypeSymbol, () => true);

export const undefinedTypeSymbol = Symbol();
export const undefined = atomic(undefinedTypeSymbol, value =>
  value === void 0
    ? true
    : `Expected undefined, getting ${toString.call(value)}.`,
);

export const voidTypeSymbol = Symbol();
export const voidType = atomic(voidTypeSymbol, value =>
  value === void 0
    ? true
    : `Expected undefined, getting ${toString.call(value)}.`,
);

export const nullTypeSymbol = Symbol();
export const nullType = atomic(nullTypeSymbol, value =>
  value === null ? true : `Expected null, getting ${toString.call(value)}.`,
);

export const stringTypeSymbol = Symbol();
export const string = atomic(stringTypeSymbol, value =>
  typeof value === 'string'
    ? true
    : `Expected string, getting ${toString.call(value)}.`,
);

export const numberTypeSymbol = Symbol();
export const number = atomic(numberTypeSymbol, value =>
  typeof value === 'number'
    ? true
    : `Expected number, getting ${toString.call(value)}.`,
);

export const booleanTypeSymbol = Symbol();
export const boolean = atomic(booleanTypeSymbol, value =>
  typeof value === 'boolean'
    ? true
    : `Expected boolean, getting ${toString.call(value)}.`,
);

export const dateTypeSymbol = Symbol();
export const Date = atomic(dateTypeSymbol, value =>
  value instanceof globalThis.Date
    ? true
    : `Expected instance of Date, getting ${toString.call(value)}.`,
);

export const regexpTypeSymbol = Symbol();
export const RegExp = atomic(regexpTypeSymbol, value =>
  value instanceof globalThis.RegExp
    ? true
    : `Expected instance of RegExp, getting ${toString.call(value)}.`,
);
