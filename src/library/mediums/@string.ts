import type {MediumAtomicCodecs} from '../core/index.js';
import {
  bigintTypeSymbol,
  booleanTypeSymbol,
  dateTypeSymbol,
  numberTypeSymbol,
  regexpTypeSymbol,
} from '../types.js';

const toString = Object.prototype.toString;

const REGEXP_LITERAL_PATTERN = /^\/(.*)\/([^/]*)$/;

export type BasicStringTypes = Record<
  typeof numberTypeSymbol | typeof booleanTypeSymbol,
  string
>;

export const BASIC_STRING_CODECS: MediumAtomicCodecs<BasicStringTypes> = {
  [numberTypeSymbol]: {
    encode(value) {
      return String(value);
    },
    decode(value) {
      return Number(value);
    },
  },
  [booleanTypeSymbol]: {
    encode(value) {
      return String(value);
    },
    decode(value) {
      switch (String(value)) {
        case 'true':
        case '1':
          return true;
        case 'false':
        case '0':
          return false;
        default:
          throw new TypeError(
            `Expected true/1/false/0, got ${toString.call(value)}`,
          );
      }
    },
  },
};

export type ExtendedStringTypes = Record<
  typeof bigintTypeSymbol | typeof dateTypeSymbol | typeof regexpTypeSymbol,
  string
>;

export const EXTENDED_STRING_CODECS: MediumAtomicCodecs<ExtendedStringTypes> = {
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

      const groups = REGEXP_LITERAL_PATTERN.exec(value);

      if (!groups) {
        throw new TypeError('Invalid regular expression literal');
      }

      return new RegExp(groups[1], groups[2]);
    },
  },
};
