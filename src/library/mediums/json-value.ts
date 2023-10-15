import type {MediumAtomicCodecs} from '../core/index.js';
import {medium} from '../core/index.js';
import type {
  booleanTypeSymbol,
  neverTypeSymbol,
  nullTypeSymbol,
  numberTypeSymbol,
  stringTypeSymbol,
  unknownTypeSymbol,
} from '../types.js';

import type {JSONExtendedTypes} from './@json-extended.js';
import {JSON_EXTENDED_CODECS} from './@json-extended.js';

export interface JSONValueTypes {
  [neverTypeSymbol]: never;
  [unknownTypeSymbol]: unknown;
  [nullTypeSymbol]: null;
  [stringTypeSymbol]: string;
  [numberTypeSymbol]: number;
  [booleanTypeSymbol]: boolean;
}

export interface UsingJSONValueMedium {
  'json-value': JSONValueTypes;
}

export const jsonValue = medium<UsingJSONValueMedium>();

export interface ExtendedJSONValueTypes
  extends JSONValueTypes,
    JSONExtendedTypes {}

export interface UsingExtendedJSONValueMedium {
  'extended-json-value': ExtendedJSONValueTypes;
}

export const extendedJSONValue = jsonValue.extend<UsingExtendedJSONValueMedium>(
  {
    codecs: JSON_EXTENDED_CODECS as MediumAtomicCodecs<ExtendedJSONValueTypes>,
  },
);
