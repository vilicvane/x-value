import type {AssertTrue, IsEqual} from 'tslang';

import * as x from '../library/index.js';

test('plug2proxy router rule', () => {
  const RouterRule = x.intersection([
    x.union([
      x.object({
        type: x.literal('ip'),
        match: x.union([x.string, x.array(x.string)]),
      }),
      x.object({
        type: x.literal('geoip'),
        match: x.union([x.string, x.array(x.string)]),
      }),
    ]),
    x.object({
      negate: x.boolean.optional(),
      route: x.union([x.literal('proxy'), x.literal('direct')]),
    }),
  ]);

  type RouterRule = x.TypeOf<typeof RouterRule>;

  type _assert = AssertTrue<
    IsEqual<
      RouterRule,
      (
        | {type: 'ip'; match: string | string[]}
        | {type: 'geoip'; match: string | string[]}
      ) & {negate?: boolean; route: 'proxy' | 'direct'}
    >
  >;

  expect(
    RouterRule.is({
      type: 'ip',
      match: '127.0.0.1',
      route: 'proxy',
    }),
  ).toBe(true);

  expect(
    RouterRule.is({
      type: 'geoip',
      match: 'CN',
      negate: false,
      route: 'direct',
    }),
  ).toBe(true);

  expect(
    RouterRule.is({
      type: 'domain',
      match: 'plug2proxy.com',
      route: 'proxy',
    }),
  ).toBe(false);
});

test('intersection union transform', () => {
  const Document = x.intersection([
    x.object({
      _id: x.string,
    }),
    x.union([
      x.object({
        type: x.literal('a'),
        a: x.string,
      }),
      x.object({
        type: x.literal('b'),
        b: x.number,
      }),
    ]),
  ]);

  type Document = x.MediumTypeOf<'json-value', typeof Document>;

  const value_1: Document = {
    _id: '123',
    type: 'a',
    a: 'abc',
  };

  const value_2: Document = {
    _id: '123',
    type: 'b',
    b: 123,
  };

  expect(Document.transform(x.jsonValue, x.jsonValue, value_1)).toEqual(
    value_1,
  );

  expect(Document.transform(x.jsonValue, x.jsonValue, value_2)).toEqual(
    value_2,
  );
});
