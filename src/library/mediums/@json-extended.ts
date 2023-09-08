import type {MediumAtomicCodecs} from '../core';
import {undefinedTypeSymbol} from '../types';

import type {ExtendedTypes} from './@extended';
import {EXTENDED_CODECS} from './@extended';

const toString = Object.prototype.toString;

export interface JSONExtendedTypes extends ExtendedTypes {
  [undefinedTypeSymbol]: null;
}

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
