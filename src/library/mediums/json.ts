import {atomicTypeSymbol, medium} from '../medium';

import type {ExtendedTypes} from './@extended';
import {EXTENDED_CODECS} from './@extended';

export interface JSONTypes {
  packed: string;
}

export interface UsingJSONMedium {
  json: JSONTypes;
}

export const json = medium<UsingJSONMedium>('json', {
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

export interface UsingExtendedJSONMedium {
  'extended-json': ExtendedJSONTypes;
}

export const extendedJSON = json.extend<UsingExtendedJSONMedium>(
  'extended-json',
  {
    codecs: EXTENDED_CODECS,
  },
);
