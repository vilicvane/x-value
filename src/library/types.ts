import {atomic} from './type';

declare global {
  namespace XValue {
    interface Types {
      [undefinedTypeSymbol]: undefined;
      [nullTypeSymbol]: null;
      [stringTypeSymbol]: string;
      [numberTypeSymbol]: number;
      [booleanTypeSymbol]: boolean;
      [dateTypeSymbol]: Date;
    }
  }
}

export const undefinedTypeSymbol = Symbol();
export const undefined = atomic(undefinedTypeSymbol, value =>
  value === void 0 ? true : 'Expecting undefined',
);

export const nullTypeSymbol = Symbol();
export const nullType = atomic(nullTypeSymbol, value =>
  value === null ? true : 'Expecting null',
);

export const stringTypeSymbol = Symbol();
export const string = atomic(stringTypeSymbol, value =>
  typeof value === 'string' ? true : 'Expecting a string',
);

export const numberTypeSymbol = Symbol();
export const number = atomic(numberTypeSymbol, value =>
  typeof value === 'number' ? true : 'Expecting a number',
);

export const booleanTypeSymbol = Symbol();
export const boolean = atomic(booleanTypeSymbol, value =>
  typeof value === 'boolean' ? true : 'Expecting a boolean',
);

export const dateTypeSymbol = Symbol();
export const Date = atomic(dateTypeSymbol, value =>
  value instanceof globalThis.Date ? true : 'Expecting an instance of Date',
);
