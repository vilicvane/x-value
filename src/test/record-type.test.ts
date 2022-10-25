import type {AssertTrue, IsEqual} from 'tslang';

import * as x from '../library';

test('record type with string key should work', () => {
  const Type = x.record(x.string, x.number);

  const value1: x.TypeOf<typeof Type> = {
    x: 1,
    y: 2,
  };

  const value2: x.TypeOf<typeof Type> = {};

  const value3: any = {
    key: 'invalid value',
  };

  const value4: any = 123;

  expect(Type.decode(x.jsonValue, value1)).toStrictEqual(value1);
  expect(Type.decode(x.jsonValue, value2)).toStrictEqual(value2);
  expect(() => Type.decode(x.jsonValue, value3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      ["key"] Expected number, getting [object String]."
  `);
  expect(() => Type.decode(x.jsonValue, value4))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expecting unpacked value to be a non-null object, getting [object Number]."
  `);

  expect(Type.encode(x.jsonValue, value1)).toStrictEqual(value1);
  expect(Type.encode(x.jsonValue, value2)).toStrictEqual(value2);
  expect(() => Type.encode(x.jsonValue, value3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      ["key"] Expected number, getting [object String]."
  `);
  expect(() => Type.encode(x.jsonValue, value4))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Expecting value to be a non-null object, getting [object Number]."
  `);

  expect(Type.transform(x.jsonValue, x.json, value1)).toStrictEqual(
    JSON.stringify(value1),
  );
  expect(Type.transform(x.jsonValue, x.json, value2)).toStrictEqual(
    JSON.stringify(value2),
  );
  expect(() => Type.transform(x.jsonValue, x.json, value3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      ["key"] Expected number, getting [object String]."
  `);
  expect(() => Type.transform(x.jsonValue, x.json, value4))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      Expecting unpacked value to be a non-null object, getting [object Number]."
  `);

  expect(Type.is({})).toBe(true);
  expect(Type.is({foo: 123, bar: 456})).toBe(true);
  expect(Type.is({key: 'abc'})).toBe(false);
  expect(Type.is(null)).toBe(false);
});

test('record type with number key should work', () => {
  const Type = x.record(x.number, x.string);

  const value1: x.TypeOf<typeof Type> = ['abc', 'def'];

  const value2: x.TypeOf<typeof Type> = [];

  const value3: any = {
    'invalid key': 'invalid value',
  };

  const value4: any = 123;

  expect(Type.decode(x.jsonValue, value1)).toStrictEqual(value1);
  expect(Type.decode(x.jsonValue, value2)).toStrictEqual(value2);
  expect(() => Type.decode(x.jsonValue, value3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      [key:"invalid key"] Expected number, getting [object String]."
  `);
  expect(() => Type.decode(x.jsonValue, value4))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expecting unpacked value to be a non-null object, getting [object Number]."
  `);

  expect(Type.encode(x.jsonValue, value1)).toStrictEqual(value1);
  expect(Type.encode(x.jsonValue, value2)).toStrictEqual(value2);
  expect(() => Type.encode(x.jsonValue, value3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      [key:"invalid key"] Expected number, getting [object String]."
  `);
  expect(() => Type.encode(x.jsonValue, value4))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Expecting value to be a non-null object, getting [object Number]."
  `);

  expect(Type.transform(x.jsonValue, x.json, value1)).toStrictEqual(
    JSON.stringify(value1),
  );
  expect(Type.transform(x.jsonValue, x.json, value2)).toStrictEqual(
    JSON.stringify(value2),
  );
  expect(() => Type.transform(x.jsonValue, x.json, value3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      [key:"invalid key"] Expected number, getting [object String]."
  `);
  expect(() => Type.transform(x.jsonValue, x.json, value4))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      Expecting unpacked value to be a non-null object, getting [object Number]."
  `);

  expect(Type.is([])).toBe(true);
  expect(Type.is(['abc', 'def'])).toBe(true);
  expect(Type.is({'invalid key': 'abc'})).toBe(false);
  expect(Type.is(null)).toBe(false);
});

test('record type with nominal string key should work', () => {
  const Email = x.string.refined<string & {_nominal: 'email'}>(value =>
    x.refinement(value.includes('@'), value, 'Expected an email address.'),
  );

  const Type = x.record(Email, x.string);

  const value1: x.TypeOf<typeof Type> = {
    ['hello@world' as string & {_nominal: 'email'}]: 'oops',
  };

  const value2 = {
    'invalid key': 'yoha',
  };

  expect(Type.decode(x.jsonValue, value1)).toStrictEqual(value1);
  expect(() => Type.decode(x.jsonValue, value2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      [key:"invalid key"] Expected an email address."
  `);

  expect(Type.encode(x.jsonValue, value1)).toStrictEqual(value1);
  expect(() => Type.encode(x.jsonValue, value2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      [key:"invalid key"] Expected an email address."
  `);

  expect(Type.transform(x.jsonValue, x.json, value1)).toStrictEqual(
    JSON.stringify(value1),
  );
  expect(() => Type.transform(x.jsonValue, x.json, value2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      [key:"invalid key"] Expected an email address."
  `);
});

test('record type with union string key should work', () => {
  const Email = x.string.refined<string & {_nominal: 'email'}>(value =>
    x.refinement(value.includes('@'), value, 'Expected an email address.'),
  );

  const Type = x.record(x.union(x.literal('foo'), Email), x.string);

  const email = 'hello@world' as x.TypeOf<typeof Email>;

  const value1: x.TypeOf<typeof Type> = {
    foo: 'oops',
    [email]: 'oops',
  };

  const value2 = {
    foo: 'oops',
    'invalid key': 'yoha',
  };

  const value3: any = {foo: 1};

  expect(Type.decode(x.jsonValue, value1)).toStrictEqual(value1);
  expect(() => Type.decode(x.jsonValue, value2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      [key:"invalid key"] The value satisfies none of the type in the union type.
      [key:"invalid key"] Expected string "foo", getting "invalid key"."
  `);
  expect(() => Type.decode(x.jsonValue, value3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      ["foo"] Expected string, getting [object Number]."
  `);

  expect(Type.encode(x.jsonValue, value1)).toStrictEqual(value1);
  expect(() => Type.encode(x.jsonValue, value2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      [key:"invalid key"] The value satisfies none of the type in the union type.
      [key:"invalid key"] Expected string "foo", getting "invalid key"."
  `);
  expect(() => Type.encode(x.jsonValue, value3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      ["foo"] Expected string, getting [object Number]."
  `);

  expect(Type.transform(x.jsonValue, x.json, value1)).toStrictEqual(
    JSON.stringify(value1),
  );
  expect(() => Type.transform(x.jsonValue, x.json, value2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      [key:"invalid key"] The value satisfies none of the type in the union type.
      [key:"invalid key"] Expected string "foo", getting "invalid key"."
  `);
  expect(() => Type.transform(x.jsonValue, x.json, value3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      ["foo"] Expected string, getting [object Number]."
  `);
});

test('exact with record type should work', () => {
  const O = x
    .object({
      foo: x.string,
      bar: x.record(
        x.string,
        x.object({
          oops: x.string,
        }),
      ),
    })
    .exact();

  const valid1 = {
    foo: 'abc',
    bar: {
      a: {
        oops: 'a',
      },
      b: {
        oops: 'a',
      },
    },
  };

  const invalid1 = {
    foo: 'abc',
    bar: {
      a: {
        oops: 'a',
      },
      b: {
        oops: 'a',
      },
    },
    extra: true,
  };

  const invalid2 = {
    foo: 'abc',
    bar: {
      a: {
        oops: 'a',
      },
      b: {
        oops: 'a',
        extra: true,
      },
    },
  };

  const invalid3 = {
    foo: 'abc',
    bar: {
      a: {
        oops: 'a',
      },
      b: {
        oops: 'a',
        extra2: true,
      },
    },
    extra1: true,
  };

  expect(O.is(valid1)).toBe(true);
  expect(O.encode(x.json, valid1)).toBe(JSON.stringify(valid1));
  expect(O.decode(x.json, JSON.stringify(valid1))).toEqual(valid1);
  expect(O.transform(x.json, x.jsonValue, JSON.stringify(valid1))).toEqual(
    valid1,
  );

  expect(O.diagnose(invalid1)).toMatchInlineSnapshot(`
    [
      {
        "deferrable": true,
        "message": "Unknown key(s) "extra".",
        "path": [],
      },
    ]
  `);
  expect(O.diagnose(invalid2)).toMatchInlineSnapshot(`
    [
      {
        "deferrable": true,
        "message": "Unknown key(s) "extra".",
        "path": [
          "bar",
          "b",
        ],
      },
    ]
  `);
  expect(O.diagnose(invalid3)).toMatchInlineSnapshot(`
    [
      {
        "deferrable": true,
        "message": "Unknown key(s) "extra2".",
        "path": [
          "bar",
          "b",
        ],
      },
      {
        "deferrable": true,
        "message": "Unknown key(s) "extra1".",
        "path": [],
      },
    ]
  `);
  expect(() => O.encode(x.json, invalid1)).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Unknown key(s) "extra"."
  `);
  expect(() => O.encode(x.json, invalid2)).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      ["bar"]["b"] Unknown key(s) "extra"."
  `);
  expect(() => O.encode(x.json, invalid3)).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      ["bar"]["b"] Unknown key(s) "extra2".
      Unknown key(s) "extra1"."
  `);
  expect(() => O.decode(x.jsonValue, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Unknown key(s) "extra"."
  `);
  expect(() => O.decode(x.jsonValue, invalid2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      ["bar"]["b"] Unknown key(s) "extra"."
  `);
  expect(() => O.decode(x.jsonValue, invalid3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      ["bar"]["b"] Unknown key(s) "extra2".
      Unknown key(s) "extra1"."
  `);
  expect(() => O.transform(x.jsonValue, x.json, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      Unknown key(s) "extra"."
  `);
  expect(() => O.transform(x.jsonValue, x.json, invalid2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      ["bar"]["b"] Unknown key(s) "extra"."
  `);
  expect(() => O.transform(x.jsonValue, x.json, invalid3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      ["bar"]["b"] Unknown key(s) "extra2".
      Unknown key(s) "extra1"."
  `);
});

test('managed exact with record type', () => {
  const O = x
    .union(
      x.object({
        foo: x.string,
        bar: x.record(
          x.string,
          x.object({
            oops: x.string,
          }),
        ),
      }),
      x.string,
    )
    .exact();

  const valid1 = {
    foo: 'abc',
    bar: {
      a: {
        oops: 'a',
      },
      b: {
        oops: 'a',
      },
    },
  };

  const invalid1 = {
    foo: 'abc',
    bar: {
      a: {
        oops: 'a',
      },
      b: {
        oops: 'a',
      },
    },
    extra: true,
  };

  const invalid2 = {
    foo: 'abc',
    bar: {
      a: {
        oops: 'a',
      },
      b: {
        oops: 'a',
        extra: true,
      },
    },
  };

  const invalid3 = {
    foo: 'abc',
    bar: {
      a: {
        oops: 'a',
      },
      b: {
        oops: 'a',
        extra2: true,
      },
    },
    extra1: true,
  };

  expect(O.is(valid1)).toBe(true);
  expect(O.encode(x.json, valid1)).toBe(JSON.stringify(valid1));
  expect(O.decode(x.json, JSON.stringify(valid1))).toEqual(valid1);
  expect(O.transform(x.json, x.jsonValue, JSON.stringify(valid1))).toEqual(
    valid1,
  );

  expect(O.diagnose(invalid1)).toMatchInlineSnapshot(`
    [
      {
        "deferrable": true,
        "message": "Unknown key(s) "extra".",
        "path": [],
      },
    ]
  `);
  expect(O.diagnose(invalid2)).toMatchInlineSnapshot(`
    [
      {
        "deferrable": true,
        "message": "Unknown key(s) "extra".",
        "path": [
          "bar",
          "b",
        ],
      },
    ]
  `);
  expect(O.diagnose(invalid3)).toMatchInlineSnapshot(`
    [
      {
        "deferrable": true,
        "message": "Unknown key(s) "extra2".",
        "path": [
          "bar",
          "b",
        ],
      },
      {
        "deferrable": true,
        "message": "Unknown key(s) "extra1".",
        "path": [],
      },
    ]
  `);
  expect(() => O.encode(x.json, invalid1)).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Unknown key(s) "extra"."
  `);
  expect(() => O.encode(x.json, invalid2)).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      ["bar"]["b"] Unknown key(s) "extra"."
  `);
  expect(() => O.encode(x.json, invalid3)).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      ["bar"]["b"] Unknown key(s) "extra2".
      Unknown key(s) "extra1"."
  `);
  expect(() => O.decode(x.jsonValue, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Unknown key(s) "extra"."
  `);
  expect(() => O.decode(x.jsonValue, invalid2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      ["bar"]["b"] Unknown key(s) "extra"."
  `);
  expect(() => O.decode(x.jsonValue, invalid3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      ["bar"]["b"] Unknown key(s) "extra2".
      Unknown key(s) "extra1"."
  `);
  expect(() => O.transform(x.jsonValue, x.json, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      Unknown key(s) "extra"."
  `);
  expect(() => O.transform(x.jsonValue, x.json, invalid2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      ["bar"]["b"] Unknown key(s) "extra"."
  `);
  expect(() => O.transform(x.jsonValue, x.json, invalid3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      ["bar"]["b"] Unknown key(s) "extra2".
      Unknown key(s) "extra1"."
  `);
});

test('exact intersection with record', () => {
  const O = x
    .object({
      foo: x.intersection(
        x.object({
          bar: x.literal('oops'),
        }),
        x.record(x.string, x.string),
      ),
    })
    .exact();

  type O = x.TypeOf<typeof O>;

  type _ = AssertTrue<
    IsEqual<
      O,
      {
        foo: {
          bar: 'oops';
          [key: string]: string;
        };
      }
    >
  >;

  const valid1: O = {
    foo: {
      bar: 'oops',
      oops: 'def',
    },
  };

  const invalid1: any = {
    foo: {
      bar: 'oops',
      oops: 'def',
    },
    extra: true,
  };

  expect(O.is(valid1)).toBe(true);
  expect(O.encode(x.json, valid1)).toBe(JSON.stringify(valid1));
  expect(O.decode(x.jsonValue, valid1)).toEqual(valid1);
  expect(O.transform(x.jsonValue, x.json, valid1)).toBe(JSON.stringify(valid1));

  expect(O.diagnose(invalid1)).toMatchInlineSnapshot(`
    [
      {
        "deferrable": true,
        "message": "Unknown key(s) "extra".",
        "path": [],
      },
    ]
  `);
  expect(() => O.encode(x.json, invalid1)).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Unknown key(s) "extra"."
  `);
  expect(() => O.decode(x.jsonValue, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Unknown key(s) "extra"."
  `);
  expect(() => O.transform(x.jsonValue, x.json, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      Unknown key(s) "extra"."
  `);
});

test('exact intersect + union with record type', () => {
  const Type = x
    .intersection(
      x.object({foo: x.string}),
      x.union(
        x.object({
          type: x.literal('a'),
        }),
        x.record(x.string, x.string),
      ),
    )
    .exact();

  const valid1 = {
    foo: 'abc',
    type: 'a',
  };

  const valid2 = {
    foo: 'abc',
    bar: 'def',
  };

  const invalid1 = {
    foo: 'abc',
    type: 'a',
    extra: true,
  };

  expect(Type.is(valid1)).toBe(true);
  expect(Type.is(valid2)).toBe(true);

  expect(Type.diagnose(invalid1)).toMatchInlineSnapshot(`
    [
      {
        "deferrable": true,
        "message": "Unknown key(s) "extra".",
        "path": [],
      },
    ]
  `);
});
