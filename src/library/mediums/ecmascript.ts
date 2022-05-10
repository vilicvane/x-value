import {atomicTypeSymbol, medium} from '../medium';
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

export const ecmascript = medium<ECMAScriptTypes>('ECMAScript', {
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
