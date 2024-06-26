import {medium} from '../core/index.js';

import {JSON_EXTENDED_CODECS} from './@json-extended.js';

export type JSONTypes = {
  packed: string;
};

export type UsingJSONMedium = {
  json: JSONTypes;
};

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

export type ExtendedJSONTypes = JSONTypes;

export type UsingExtendedJSONMedium = {
  'extended-json': ExtendedJSONTypes;
};

export const extendedJSON = json.extend<UsingExtendedJSONMedium>({
  codecs: JSON_EXTENDED_CODECS,
});
