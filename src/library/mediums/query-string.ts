import {medium} from '../core/index.js';

import {BASIC_STRING_CODECS, EXTENDED_STRING_CODECS} from './@string.js';

const toString = Object.prototype.toString;

export type QueryStringTypes = {
  packed: string;
};

export type UsingQueryStringMedium = {
  'query-string': QueryStringTypes;
};

export const queryString = medium<UsingQueryStringMedium>({
  packing: {
    pack(data) {
      return stringify(data);
    },
    unpack(queryString) {
      return parse(queryString);
    },
  },
  codecs: BASIC_STRING_CODECS,
});

export type ExtendedQueryStringTypes = QueryStringTypes;

export type UsingExtendedQueryStringMedium = {
  'extended-query-string': ExtendedQueryStringTypes;
};

export const extendedQueryString =
  queryString.extend<UsingExtendedQueryStringMedium>({
    codecs: EXTENDED_STRING_CODECS,
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
