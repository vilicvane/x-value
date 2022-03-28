import {atomic} from './type';

declare global {
  namespace XValue {
    interface Values {
      [undefinedSymbol]: undefined;
      [stringSymbol]: string;
      [numberSymbol]: number;
      [DateSymbol]: Date;
    }
  }
}

export const undefinedSymbol = Symbol();
export const undefined = atomic(undefinedSymbol, value => value === void 0);

export const nullSymbol = Symbol();
export const nullType = atomic(nullSymbol, value => value === null);

export const stringSymbol = Symbol();
export const string = atomic(stringSymbol, value => typeof value === 'string');

export const numberSymbol = Symbol();
export const number = atomic(numberSymbol, value => typeof value === 'number');

// export const integerSymbol = Symbol();
// export const integer = number.refine(integerSymbol, () => {});

export const DateSymbol = Symbol();
export const Date = atomic(
  DateSymbol,
  value => value instanceof globalThis.Date,
);
