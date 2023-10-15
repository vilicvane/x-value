import type {AssertTrue, IsEqual} from 'tslang';

import * as x from '../library/index.js';

test('recursive type should work', () => {
  interface RecursiveR {
    type: 'node';
    text?: typeof x.string;
    children?: RecursiveR[];
  }

  const R = x.recursive<RecursiveR>(R =>
    x.object({
      type: x.literal('node'),
      children: x.array(R),
    }),
  );

  type R = x.TypeOf<typeof R>;

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

  // @ts-expect-error
  expect(() => R.encode(x.jsonValue, {})).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      ["type"] Expected string, got [object Undefined].
      ["children"] Expected an array, got [object Undefined]."
  `);
  expect(() =>
    R.decode(x.jsonValue, {
      type: 'node',
      // @ts-expect-error
      children: ['text'],
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      ["children"][0] Expected a non-null object, got [object String]."
  `);
  expect(() =>
    R.transform(x.jsonValue, x.json, {
      type: 'node',
      children: [
        {
          type: 'node',
          children: [
            {
              // @ts-expect-error
              type: 'oops',
              children: [],
            },
          ],
        },
      ],
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      ["children"][0]["children"][0]["type"] Expected string "node", got "oops"."
  `);

  interface RefR {
    type: 'node';
    text?: string;
    children?: RefR[];
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
    type: 'node' as const,
    children: [
      {
        type: 'node' as const,
        children: [],
      },
    ],
  };

  const invalid1 = {
    type: 'node' as const,
    children: [
      {
        type: 'node' as const,
        children: [],
      },
    ],
    extra: true,
  };

  const invalid2 = {
    type: 'node' as const,
    children: [
      {
        type: 'node' as const,
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
    [
      {
        "deferrable": true,
        "message": "Unknown key(s) "extra".",
        "path": [],
      },
    ]
  `);
  expect(R.diagnose(invalid2)).toMatchInlineSnapshot(`
    [
      {
        "deferrable": true,
        "message": "Unknown key(s) "extra".",
        "path": [
          "children",
          0,
        ],
      },
    ]
  `);
  expect(() => R.encode(x.json, invalid1)).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Unknown key(s) "extra"."
  `);
  expect(() => R.encode(x.json, invalid2)).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      ["children"][0] Unknown key(s) "extra"."
  `);
  expect(() => R.decode(x.jsonValue, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Unknown key(s) "extra"."
  `);
  expect(() => R.decode(x.jsonValue, invalid2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      ["children"][0] Unknown key(s) "extra"."
  `);
  expect(() => R.transform(x.jsonValue, x.json, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      Unknown key(s) "extra"."
  `);
  expect(() => R.transform(x.jsonValue, x.json, invalid2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      ["children"][0] Unknown key(s) "extra"."
  `);
});

test('recursive type with non-recursive part', () => {
  const NonRecursivePart = x.object({
    type: x.string,
    date: x.Date,
  });

  type RecursiveTypeDefinition = x.Recursive<
    {
      next?: RecursiveTypeDefinition;
    },
    typeof NonRecursivePart
  >;

  const RecursiveType = x.recursive<RecursiveTypeDefinition>(RecursiveType =>
    NonRecursivePart.extend({
      next: RecursiveType.optional(),
    }),
  );

  type RecursiveType = x.TypeOf<typeof RecursiveType>;

  type RecursiveTypeInExtendedJSONValue = x.MediumTypeOf<
    'extended-json-value',
    typeof RecursiveType
  >;

  const value_1: RecursiveType = {
    type: 'node',
    date: new Date(),
  };

  const value_2: RecursiveType = {
    type: 'node',
    date: new Date(),
    next: {
      type: 'leaf',
      date: new Date(),
    },
  };

  expect(RecursiveType.is(value_1)).toBe(true);
  expect(RecursiveType.is(value_2)).toBe(true);
  expect(RecursiveType.is({type: 'node', next: {}})).toBe(false);

  expect(RecursiveType.encode(x.extendedJSONValue, value_1)).toEqual(
    JSON.parse(JSON.stringify(value_1)),
  );
  expect(RecursiveType.encode(x.extendedJSONValue, value_2)).toEqual(
    JSON.parse(JSON.stringify(value_2)),
  );

  interface RecursiveTypeComparison {
    type: string;
    date: Date;
    next?: RecursiveTypeComparison;
  }

  interface RecursiveTypeInExtendedJSONValueComparison {
    type: string;
    date: string;
    next?: RecursiveTypeInExtendedJSONValueComparison;
  }

  type _ =
    | AssertTrue<IsEqual<RecursiveType, RecursiveTypeComparison>>
    | AssertTrue<
        IsEqual<
          RecursiveTypeInExtendedJSONValue,
          RecursiveTypeInExtendedJSONValueComparison
        >
      >;
});
