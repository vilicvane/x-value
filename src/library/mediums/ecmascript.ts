import {atomicTypeSymbol, medium} from '../core';
import type {
  bigintTypeSymbol,
  booleanTypeSymbol,
  dateTypeSymbol,
  nullTypeSymbol,
  numberTypeSymbol,
  regexpTypeSymbol,
  stringTypeSymbol,
  undefinedTypeSymbol,
  unknownTypeSymbol,
  voidTypeSymbol,
} from '../types';

export interface ECMAScriptTypes {
  [unknownTypeSymbol]: unknown;
  [undefinedTypeSymbol]: undefined;
  [voidTypeSymbol]: void;
  [nullTypeSymbol]: null;
  [stringTypeSymbol]: string;
  [numberTypeSymbol]: number;
  [bigintTypeSymbol]: bigint;
  [booleanTypeSymbol]: boolean;
  [dateTypeSymbol]: Date;
  [regexpTypeSymbol]: RegExp;
}

export interface UsingECMAScriptMedium {
  ecmascript: ECMAScriptTypes;
}

export const ecmascript = medium<UsingECMAScriptMedium>('ecmascript', {
  codecs: {
    [atomicTypeSymbol]: {
      encode(value) {
        return value;
      },
      decode(value) {
        return value;
      },
    },
  },
});
