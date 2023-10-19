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

export type JSONValueTypes = {
  [neverTypeSymbol]: never;
  [unknownTypeSymbol]: unknown;
  [nullTypeSymbol]: null;
  [stringTypeSymbol]: string;
  [numberTypeSymbol]: number;
  [booleanTypeSymbol]: boolean;
};

export type UsingJSONValueMedium = {
  'json-value': JSONValueTypes;
};

export const jsonValue = medium<UsingJSONValueMedium>();

export type ExtendedJSONValueTypes = {} & JSONValueTypes & JSONExtendedTypes;

export type UsingExtendedJSONValueMedium = {
  'extended-json-value': ExtendedJSONValueTypes;
};

export const extendedJSONValue = jsonValue.extend<UsingExtendedJSONValueMedium>(
  {
    codecs: JSON_EXTENDED_CODECS as MediumAtomicCodecs<ExtendedJSONValueTypes>,
  },
);
