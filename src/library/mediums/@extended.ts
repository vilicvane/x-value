import type {MediumAtomicCodecs} from '../core/index.js';
import {bigintTypeSymbol, dateTypeSymbol, regexpTypeSymbol} from '../types.js';

const toString = Object.prototype.toString;

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
          `Expected bigint string, got ${toString.call(value)}`,
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
          `Expected ISO date string, got ${toString.call(value)}`,
        );
      }

      const date = new Date(value);

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
          `Expected regular expression literal, got ${toString.call(value)}`,
        );
      }

      const groups = REGEXP_LITERAL_REGEX.exec(value);

      if (!groups) {
        throw new TypeError('Invalid regular expression literal');
      }

      return new RegExp(groups[1], groups[2]);
    },
  },
};
