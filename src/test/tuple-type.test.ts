import * as x from '../library/index.js';

test('tuple type should work', () => {
  const Tuple = x.tuple([x.string, x.number]);

  const valid1: x.TypeOf<typeof Tuple> = ['abc', 123];
  const invalid1: any = ['abc', 'def'];
  const invalid2: any = 123;
  const invalid3: any = ['abc', 123, true];

  expect(Tuple.diagnose(invalid3)).toMatchInlineSnapshot(`
    [
      {
        "message": "Expected value with 2 instead of 3 element(s).",
        "path": [],
      },
    ]
  `);
  expect(() => Tuple.encode(x.json, invalid3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Expected value with 2 instead of 3 element(s)."
  `);
  expect(() => Tuple.decode(x.jsonValue, invalid3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expected value with 2 instead of 3 element(s)."
  `);
  expect(() => Tuple.transform(x.jsonValue, x.json, invalid3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      Expected value with 2 instead of 3 element(s)."
  `);

  expect(Tuple.decode(x.jsonValue, valid1)).toEqual(valid1);
  expect(() => Tuple.decode(x.jsonValue, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      [1] Expected number, got [object String]."
  `);
  expect(() => Tuple.decode(x.jsonValue, invalid2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expected an array, got [object Number]."
  `);

  expect(Tuple.encode(x.jsonValue, valid1)).toEqual(valid1);
  expect(() => Tuple.encode(x.jsonValue, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      [1] Expected number, got [object String]."
  `);
  expect(() => Tuple.encode(x.jsonValue, invalid2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Expected an array, got [object Number]."
  `);

  expect(Tuple.transform(x.jsonValue, x.json, valid1)).toBe(
    JSON.stringify(valid1),
  );
  expect(() => Tuple.transform(x.jsonValue, x.json, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      [1] Expected number, got [object String]."
  `);
  expect(() => Tuple.transform(x.jsonValue, x.json, invalid2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      Expected an array, got [object Number]."
  `);

  expect(Tuple.is(valid1)).toBe(true);
  expect(Tuple.is(invalid1)).toBe(false);
  expect(Tuple.is(invalid2)).toBe(false);
});

test('tuple with optional elements should work', () => {
  const Tuple = x.tuple([x.string, x.number.optional()]);

  type Tuple = x.TypeOf<typeof Tuple>;

  const valid1: Tuple = ['abc'];
  const valid2: Tuple = ['abc', 123];
  const invalid1: any = ['abc', 'def'];
  const invalid2: any = [123];
  const invalid3: any = ['abc', 123, true];

  expect(Tuple.is(valid1)).toBe(true);
  expect(Tuple.is(valid2)).toBe(true);
  expect(Tuple.is(invalid1)).toBe(false);
  expect(Tuple.is(invalid2)).toBe(false);
  expect(Tuple.is(invalid3)).toBe(false);

  expect(Tuple.encode(x.jsonValue, valid1)).toEqual(valid1);
  expect(Tuple.decode(x.jsonValue, valid1)).toEqual(valid1);

  expect(() => Tuple.encode(x.jsonValue, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
"Failed to encode to medium:
  [1] Expected number, got [object String]."
`);

  expect(() => Tuple.decode(x.jsonValue, invalid3))
    .toThrowErrorMatchingInlineSnapshot(`
"Failed to decode from medium:
  Expected value with 1 to 2 instead of 3 element(s)."
`);
});

test('exact with tuple type should work', () => {
  const Tuple = x
    .tuple([
      x.string,
      x.object({
        foo: x.string,
        bar: x.number,
      }),
    ])
    .exact();

  type Tuple = x.TypeOf<typeof Tuple>;

  const valid1: Tuple = [
    'hello',
    {
      foo: 'abc',
      bar: 123,
    },
  ];

  const invalid1: any = [
    'hello',
    {
      foo: 'abc',
      bar: 123,
      extra: true,
    },
  ];

  expect(Tuple.is(valid1)).toBe(true);
  expect(Tuple.encode(x.jsonValue, valid1)).toEqual(valid1);
  expect(Tuple.decode(x.jsonValue, valid1)).toEqual(valid1);
  expect(Tuple.transform(x.jsonValue, x.json, valid1)).toBe(
    JSON.stringify(valid1),
  );

  expect(Tuple.diagnose(invalid1)).toMatchInlineSnapshot(`
    [
      {
        "deferrable": true,
        "message": "Unknown key(s) "extra".",
        "path": [
          1,
        ],
      },
    ]
  `);
  expect(() => Tuple.encode(x.json, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      [1] Unknown key(s) "extra"."
  `);
  expect(() => Tuple.decode(x.jsonValue, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      [1] Unknown key(s) "extra"."
  `);
  expect(() => Tuple.transform(x.jsonValue, x.json, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      [1] Unknown key(s) "extra"."
  `);
});

test('exact + intersection with tuple type', () => {
  const Tuple = x
    .intersection([
      x.tuple([
        x.string,
        x.object({
          foo: x.string,
          bar: x.number,
        }),
      ]),
      x.object({}),
    ])
    .exact();

  type Tuple = x.TypeOf<typeof Tuple>;

  const valid1: Tuple = [
    'hello',
    {
      foo: 'abc',
      bar: 123,
    },
  ];

  const invalid1: any = [
    'hello',
    {
      foo: 'abc',
      bar: 123,
      extra: true,
    },
  ];

  expect(Tuple.is(valid1)).toBe(true);
  expect(Tuple.encode(x.jsonValue, valid1)).toEqual(valid1);
  expect(Tuple.decode(x.jsonValue, valid1)).toEqual(valid1);
  expect(Tuple.transform(x.jsonValue, x.json, valid1)).toBe(
    JSON.stringify(valid1),
  );

  expect(Tuple.diagnose(invalid1)).toMatchInlineSnapshot(`
    [
      {
        "deferrable": true,
        "message": "Unknown key(s) "extra".",
        "path": [
          1,
        ],
      },
    ]
  `);
  expect(() => Tuple.encode(x.json, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      [1] Unknown key(s) "extra"."
  `);
  expect(() => Tuple.decode(x.jsonValue, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      [1] Unknown key(s) "extra"."
  `);
  expect(() => Tuple.transform(x.jsonValue, x.json, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      [1] Unknown key(s) "extra"."
  `);
});
