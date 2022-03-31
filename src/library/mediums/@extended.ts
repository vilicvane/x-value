import {MediumAtomicCodecs} from '../medium';
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
        throw new TypeError('Invalid date value');
      }

      let value = new Date(date);

      if (isNaN(value.getTime())) {
        throw new TypeError('Invalid date value');
      }

      return value;
    },
  },
};
