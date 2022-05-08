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

export const jsonValue = medium<JSONValueTypes>('JSON Value', {
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

export const extendedJSONValue = jsonValue.extend<ExtendedJSONValueTypes>(
  'Extended JSON Value',
  {
    codecs: EXTENDED_CODECS as MediumAtomicCodecs<ExtendedJSONValueTypes>,
  },
);
