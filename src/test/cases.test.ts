import type {AssertTrue, IsEqual} from 'tslang';

import * as x from '../library';

test('plug2proxy router rule', () => {
  const RouterRule = x.intersection(
    x.union(
      x.object({
        type: x.literal('ip'),
        match: x.union(x.string, x.array(x.string)),
      }),
      x.object({
        type: x.literal('geoip'),
        match: x.union(x.string, x.array(x.string)),
      }),
    ),
    x.object({
      negate: x.boolean.optional(),
      route: x.union(x.literal('proxy'), x.literal('direct')),
    }),
  );

  type RouterRule = x.TypeOf<typeof RouterRule>;

  type _ = AssertTrue<
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
