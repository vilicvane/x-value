import type {MediumAtomicCodecs} from '../core/index.js';
import {undefinedTypeSymbol} from '../types.js';

import type {ExtendedTypes} from './@extended.js';
import {EXTENDED_CODECS} from './@extended.js';

const toString = Object.prototype.toString;

export type JSONExtendedTypes = {
  [undefinedTypeSymbol]: null;
} & ExtendedTypes;

export const JSON_EXTENDED_CODECS: MediumAtomicCodecs<JSONExtendedTypes> = {
  ...EXTENDED_CODECS,
  [undefinedTypeSymbol]: {
    encode() {
      return null;
    },
    decode(value) {
      if (value != null) {
        throw new TypeError(
          `Expected undefined/null, got ${toString.call(value)}`,
        );
      }

      return undefined;
    },
  },
};
