import type {AssertTrue, IsEqual} from 'tslang';

import * as x from '../library';
import type {TypeOf} from '../library';

test('recursive type should work', () => {
  interface RecursiveR {
    type: 'node';
    text?: typeof x.string;
    children: RecursiveR[];
  }

  const R = x.recursive<RecursiveR>(R =>
    x.object({
      type: x.literal('node'),
      children: x.array(R),
    }),
  );

  type R = TypeOf<typeof R>;

  const a: R = {
    type: 'node',
    children: [
      {
        type: 'node',
        children: [],
      },
    ],
  };

  expect(R.encode(x.jsonValue, {...a, text: 'hello'})).toEqual(a);
  expect(R.decode(x.jsonValue, {...a, extra: true} as R)).toEqual(a);
  expect(R.transform(x.jsonValue, x.json, {...a, extra: true} as R)).toBe(
    JSON.stringify(a),
  );

  expect(R.is({type: 'oops', children: []})).toBe(false);

  expect(() => R.encode(x.jsonValue, {} as any))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      [\\"type\\"] Expected string, getting [object Undefined].
      [\\"children\\"] Expecting value to be an array, getting [object Undefined]."
  `);
  expect(() =>
    R.decode(x.jsonValue, {
      type: 'node',
      children: ['text'],
    } as any),
  ).toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      [\\"children\\"][0] Expecting unpacked value to be a non-null object, getting [object String]."
  `);
  expect(() =>
    R.transform(x.jsonValue, x.json, {
      type: 'node',
      children: [
        {
          type: 'node',
          children: [
            {
              type: 'oops',
              children: [],
            },
          ],
        },
      ],
    } as any),
  ).toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      [\\"children\\"][0][\\"children\\"][0][\\"type\\"] Expected string \\"node\\", getting \\"oops\\"."
  `);

  interface RefR {
    type: 'node';
    text?: string;
    children: RefR[];
  }

  type _ = AssertTrue<IsEqual<R, RefR>>;
});

test('exact with recursive type should work', () => {
  interface RecursiveR {
    type: 'node';
    text?: string;
    children: RecursiveR[];
  }

  const R = x
    .recursive<RecursiveR>(R =>
      x.object({
        type: x.literal('node'),
        children: x.array(R),
      }),
    )
    .exact();

  const valid1 = {
    type: 'node' as 'node',
    children: [
      {
        type: 'node' as 'node',
        children: [],
      },
    ],
  };

  const invalid1 = {
    type: 'node' as 'node',
    children: [
      {
        type: 'node' as 'node',
        children: [],
      },
    ],
    extra: true,
  };

  const invalid2 = {
    type: 'node' as 'node',
    children: [
      {
        type: 'node' as 'node',
        children: [],
        extra: true,
      },
    ],
  };

  expect(R.is(valid1)).toBe(true);
  expect(R.encode(x.jsonValue, valid1)).toEqual(valid1);
  expect(R.decode(x.jsonValue, valid1)).toEqual(valid1);
  expect(R.transform(x.jsonValue, x.json, valid1)).toBe(JSON.stringify(valid1));

  expect(R.diagnose(invalid1)).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "Unknown key(s) \\"extra\\".",
        "path": Array [],
      },
    ]
  `);
  expect(R.diagnose(invalid2)).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "Unknown key(s) \\"extra\\".",
        "path": Array [
          "children",
          0,
        ],
      },
    ]
  `);
  expect(() => R.encode(x.json, invalid1)).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Unknown key(s) \\"extra\\"."
  `);
  expect(() => R.encode(x.json, invalid2)).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      [\\"children\\"][0] Unknown key(s) \\"extra\\"."
  `);
  expect(() => R.decode(x.jsonValue, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Unknown key(s) \\"extra\\"."
  `);
  expect(() => R.decode(x.jsonValue, invalid2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      [\\"children\\"][0] Unknown key(s) \\"extra\\"."
  `);
  expect(() => R.transform(x.jsonValue, x.json, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      Unknown key(s) \\"extra\\"."
  `);
  expect(() => R.transform(x.jsonValue, x.json, invalid2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      [\\"children\\"][0] Unknown key(s) \\"extra\\"."
  `);
});
