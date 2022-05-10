import {toString} from '../@utils';
import type {MediumAtomicCodecs} from '../medium';
import {bigintTypeSymbol, dateTypeSymbol, regexpTypeSymbol} from '../types';

const REGEXP_LITERAL_REGEX = /^\/(.*)\/([^/]*)$/;

export interface ExtendedTypes {
  [bigintTypeSymbol]: string;
  [dateTypeSymbol]: string;
  [regexpTypeSymbol]: string;
}

export const EXTENDED_CODECS: MediumAtomicCodecs<ExtendedTypes> = {
  [bigintTypeSymbol]: {
    encode(bigint) {
      return bigint.toString();
    },
    decode(value) {
      if (typeof value !== 'string') {
        throw new TypeError(
          `Expected bigint string, getting ${toString.call(value)}`,
        );
      }

      return BigInt(value);
    },
  },
  [dateTypeSymbol]: {
    encode(date) {
      return date.toISOString();
    },
    decode(value) {
      if (typeof value !== 'string') {
        throw new TypeError(
          `Expected ISO date string, getting ${toString.call(value)}`,
        );
      }

      let date = new Date(value);

      if (isNaN(date.getTime())) {
        throw new TypeError('Invalid date value');
      }

      return date;
    },
  },
  [regexpTypeSymbol]: {
    encode(regexp) {
      return `/${regexp.source}/${regexp.flags}`;
    },
    decode(value) {
      if (typeof value !== 'string') {
        throw new TypeError(
          `Expected regular expression literal, getting ${toString.call(
            value,
          )}`,
        );
      }

      let groups = REGEXP_LITERAL_REGEX.exec(value);

      if (!groups) {
        throw new TypeError('Invalid regular expression literal');
      }

      return new RegExp(groups[1], groups[2]);
    },
  },
};
