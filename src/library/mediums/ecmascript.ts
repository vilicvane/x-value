import {medium} from '../core/index.js';
import type {
  bigintTypeSymbol,
  booleanTypeSymbol,
  dateTypeSymbol,
  functionTypeSymbol,
  neverTypeSymbol,
  nullTypeSymbol,
  numberTypeSymbol,
  regexpTypeSymbol,
  stringTypeSymbol,
  undefinedTypeSymbol,
  unknownTypeSymbol,
  voidTypeSymbol,
} from '../types.js';

export interface ECMAScriptTypes {
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

export interface UsingECMAScriptMedium {
  ecmascript: ECMAScriptTypes;
}

export const ecmascript = medium<UsingECMAScriptMedium>();
