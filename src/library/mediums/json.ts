import {medium} from '../core';

import type {ExtendedTypes} from './@extended';
import {EXTENDED_CODECS} from './@extended';

export interface JSONTypes {
  packed: string;
}

export interface UsingJSONMedium {
  json: JSONTypes;
}

export const json = medium<UsingJSONMedium>({
  packing: {
    pack(data) {
      return JSON.stringify(data);
    },
    unpack(json) {
      return JSON.parse(json);
    },
  },
});

export interface ExtendedJSONTypes extends JSONTypes, ExtendedTypes {}

export interface UsingExtendedJSONMedium {
  'extended-json': ExtendedJSONTypes;
}

export const extendedJSON = json.extend<UsingExtendedJSONMedium>({
  codecs: EXTENDED_CODECS,
});
