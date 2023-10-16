import {atomic} from './core/index.js';
import {constraint} from './utils.js';

const toString = Object.prototype.toString;

declare global {
  namespace XValue {
    interface Types {
      [neverTypeSymbol]: never;
      [unknownTypeSymbol]: unknown;
      [undefinedTypeSymbol]: undefined;
      [voidTypeSymbol]: void;
      [nullTypeSymbol]: null;
      [stringTypeSymbol]: string;
      [numberTypeSymbol]: number;
      [bigintTypeSymbol]: bigint;
      [booleanTypeSymbol]: boolean;
      [functionTypeSymbol]: Function;
      [dateTypeSymbol]: Date;
      [regexpTypeSymbol]: RegExp;
    }

    interface Using {
      value: Types;
    }

    type UsingName = keyof Using;
  }
}

export const neverTypeSymbol = Symbol();
export const never = atomic(neverTypeSymbol, value => {
  throw `Expected never, got ${toString.call(value)}.`;
});

export const unknownTypeSymbol = Symbol();
export const unknown = atomic(unknownTypeSymbol, [], {});

export const undefinedTypeSymbol = Symbol();
// eslint-disable-next-line no-shadow-restricted-names
export const undefined = atomic(undefinedTypeSymbol, value =>
  constraint(
    value === void 0,
    () => `Expected undefined, got ${toString.call(value)}.`,
  ),
);

export const voidTypeSymbol = Symbol();
export const voidType = atomic(voidTypeSymbol, value =>
  constraint(
    value === void 0,
    () => `Expected undefined, got ${toString.call(value)}.`,
  ),
);

export {voidType as void};

export const nullTypeSymbol = Symbol();
export const nullType = atomic(
  nullTypeSymbol,
  value =>
    constraint(
      value === null,
      () => `Expected null, got ${toString.call(value)}.`,
    ),
  {type: 'null'},
);

export {nullType as null};

export const stringTypeSymbol = Symbol();
export const string = atomic(
  stringTypeSymbol,
  value =>
    constraint(
      typeof value === 'string',
      () => `Expected string, got ${toString.call(value)}.`,
    ),
  {type: 'string'},
);

export const numberTypeSymbol = Symbol();
export const number = atomic(
  numberTypeSymbol,
  value =>
    constraint(
      typeof value === 'number',
      () => `Expected number, got ${toString.call(value)}.`,
    ),
  {type: 'number'},
);

export const bigintTypeSymbol = Symbol();
export const bigint = atomic(
  bigintTypeSymbol,
  value =>
    constraint(
      typeof value === 'bigint',
      () => `Expected bigint, got ${toString.call(value)}.`,
    ),
  {type: 'integer'},
);

export const booleanTypeSymbol = Symbol();
export const boolean = atomic(
  booleanTypeSymbol,
  value =>
    constraint(
      typeof value === 'boolean',
      () => `Expected boolean, got ${toString.call(value)}.`,
    ),
  {type: 'boolean'},
);

export const functionTypeSymbol = Symbol();
export const Function = atomic(functionTypeSymbol, value =>
  constraint(
    typeof value === 'function',
    () => `Expected function, got ${toString.call(value)}.`,
  ),
);

export const dateTypeSymbol = Symbol();
export const Date = atomic(dateTypeSymbol, value =>
  constraint(
    value instanceof globalThis.Date,
    () => `Expected instance of Date, got ${toString.call(value)}.`,
  ),
);

export const regexpTypeSymbol = Symbol();
export const RegExp = atomic(regexpTypeSymbol, value =>
  constraint(
    value instanceof globalThis.RegExp,
    () => `Expected instance of RegExp, got ${toString.call(value)}.`,
  ),
);
