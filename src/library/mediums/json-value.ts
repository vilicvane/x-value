import type {MediumAtomicCodecs} from '../core';
import {medium} from '../core';
import type {
  booleanTypeSymbol,
  neverTypeSymbol,
  nullTypeSymbol,
  numberTypeSymbol,
  stringTypeSymbol,
  unknownTypeSymbol,
} from '../types';

import type {JSONExtendedTypes} from './@json-extended';
import {JSON_EXTENDED_CODECS} from './@json-extended';

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
