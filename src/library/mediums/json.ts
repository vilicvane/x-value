import {atomicTypeSymbol, medium} from '../medium';

import {EXTENDED_CODECS, ExtendedTypes} from './@extended';

export interface JSONTypes {
  packed: string;
}

export const json = medium<JSONTypes>('JSON', {
  packing: {
    pack(data) {
      return JSON.stringify(data);
    },
    unpack(json) {
      return JSON.parse(json);
    },
  },
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

export interface ExtendedJSONTypes extends JSONTypes, ExtendedTypes {}

export const extendedJSON = json.extend<ExtendedJSONTypes>('Extended JSON', {
  codecs: EXTENDED_CODECS,
});
