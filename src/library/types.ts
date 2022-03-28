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
export const undefined = atomic(undefinedSymbol);

export const nullSymbol = Symbol();
export const nullType = atomic(nullSymbol);

export const stringSymbol = Symbol();
export const string = atomic(stringSymbol);

export const numberSymbol = Symbol();
export const number = atomic(numberSymbol);

export const DateSymbol = Symbol();
export const Date = atomic(DateSymbol);
