import type {MediumAtomicCodecs} from '../medium';
import {atomicTypeSymbol, medium} from '../medium';
import type {
  booleanTypeSymbol,
  nullTypeSymbol,
  numberTypeSymbol,
  stringTypeSymbol,
} from '../types';

import type {ExtendedTypes} from './@extended';
import {EXTENDED_CODECS} from './@extended';

export interface JSONValueTypes {
  [nullTypeSymbol]: null;
  [stringTypeSymbol]: string;
  [numberTypeSymbol]: number;
  [booleanTypeSymbol]: boolean;
}

export interface UsingJSONValueMedium {
  'json-value': JSONValueTypes;
}

export const jsonValue = medium<UsingJSONValueMedium>('json-value', {
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

export interface ExtendedJSONValueTypes extends JSONValueTypes, ExtendedTypes {}

export interface UsingExtendedJSONValueMedium {
  'extended-json-value': ExtendedJSONValueTypes;
}

export const extendedJSONValue = jsonValue.extend<UsingExtendedJSONValueMedium>(
  'extended-json-value',
  {
    codecs: EXTENDED_CODECS as MediumAtomicCodecs<ExtendedJSONValueTypes>,
  },
);
