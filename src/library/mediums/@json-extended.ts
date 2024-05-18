import type {MediumAtomicCodecs} from '../core/index.js';
import {undefinedTypeSymbol} from '../types.js';

import type {ExtendedStringTypes} from './@string.js';
import {EXTENDED_STRING_CODECS} from './@string.js';

const toString = Object.prototype.toString;

export type JSONExtendedTypes = {
  [undefinedTypeSymbol]: null;
} & ExtendedStringTypes;

export const JSON_EXTENDED_CODECS: MediumAtomicCodecs<JSONExtendedTypes> = {
  ...EXTENDED_STRING_CODECS,
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
