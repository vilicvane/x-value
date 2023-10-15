import {medium} from '../core/index.js';

import type {JSONExtendedTypes} from './@json-extended.js';
import {JSON_EXTENDED_CODECS} from './@json-extended.js';

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

export interface ExtendedJSONTypes extends JSONTypes, JSONExtendedTypes {}

export interface UsingExtendedJSONMedium {
  'extended-json': ExtendedJSONTypes;
}

export const extendedJSON = json.extend<UsingExtendedJSONMedium>({
  codecs: JSON_EXTENDED_CODECS,
});
