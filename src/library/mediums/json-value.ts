import {MediumAtomicCodecs, atomicTypeSymbol, medium} from '../medium';
import {
  booleanTypeSymbol,
  nullTypeSymbol,
  numberTypeSymbol,
  stringTypeSymbol,
} from '../types';

import {EXTENDED_CODECS, ExtendedTypes} from './@extended';

declare global {
  namespace XValue {
    interface JSONValueTypes {
      [nullTypeSymbol]: null;
      [stringTypeSymbol]: string;
      [numberTypeSymbol]: number;
      [booleanTypeSymbol]: boolean;
    }
  }
}

export const jsonValue = medium<XValue.JSONValueTypes>('JSON Value', {
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

export interface ExtendedJSONValueTypes
  extends XValue.JSONValueTypes,
    ExtendedTypes {}

export const extendedJSONValue = jsonValue.extend<ExtendedJSONValueTypes>(
  'Extended JSON Value',
  {
    codecs: EXTENDED_CODECS as MediumAtomicCodecs<ExtendedJSONValueTypes>,
  },
);
