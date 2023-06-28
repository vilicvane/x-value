import {atomicTypeSymbol, medium} from '../core';
import {booleanTypeSymbol, numberTypeSymbol} from '../types';

import type {ExtendedTypes} from './@extended';
import {EXTENDED_CODECS} from './@extended';

const toString = Object.prototype.toString;

export interface QueryStringTypes {
  packed: string;
}

export interface UsingQueryStringMedium {
  'query-string': QueryStringTypes;
}

export const queryString = medium<UsingQueryStringMedium>({
  packing: {
    pack(data) {
      return stringify(data);
    },
    unpack(queryString) {
      return parse(queryString);
    },
  },
  codecs: {
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
        value = String(value);

        const numberValue = Number(value);

        if (!isNaN(numberValue)) {
          return numberValue !== 0;
        }

        return value === 'true';
      },
    },
    [atomicTypeSymbol]: {
      encode(value) {
        return String(value);
      },
      decode(value) {
        return value;
      },
    },
  },
});

export interface ExtendedQueryStringTypes
  extends QueryStringTypes,
    ExtendedTypes {}

export interface UsingExtendedQueryStringMedium {
  'extended-query-string': ExtendedQueryStringTypes;
}

export const extendedQueryString =
  queryString.extend<UsingExtendedQueryStringMedium>({
    codecs: EXTENDED_CODECS,
  });

function stringify(dict: unknown): string {
  if (typeof dict !== 'object' || dict === null) {
    throw new TypeError(`Expected non-null object, got ${toString.call(dict)}`);
  }

  return Object.entries(dict)
    .filter(([, value]) => value !== undefined)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join('&');
}

function parse(queryString: string): Record<string, string> {
  if (queryString.length === 0) {
    return {};
  }

  return Object.fromEntries(
    queryString.split('&').map(part => {
      let index = part.indexOf('=');

      if (index < 0) {
        index = part.length;
      }

      return [
        decodeURIComponent(part.slice(0, index)),
        decodeURIComponent(part.slice(index + 1)),
      ];
    }),
  );
}
