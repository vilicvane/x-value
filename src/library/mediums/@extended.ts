import {toString} from '../@utils';
import type {MediumAtomicCodecs} from '../medium';
import {dateTypeSymbol} from '../types';

export interface ExtendedTypes {
  [dateTypeSymbol]: string;
}

export const EXTENDED_CODECS: MediumAtomicCodecs<ExtendedTypes> = {
  [dateTypeSymbol]: {
    encode(date) {
      return date.toISOString();
    },
    decode(date) {
      if (typeof date !== 'string') {
        throw new TypeError(
          `Expected ISO date string, getting ${toString.call(date)}`,
        );
      }

      let value = new Date(date);

      if (isNaN(value.getTime())) {
        throw new TypeError('Invalid date value');
      }

      return value;
    },
  },
};
