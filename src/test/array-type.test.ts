import * as x from '../library';
import type {TypeOf} from '../library';
import {TypeConstraintError} from '../library';

test('simple array type should work with json medium', () => {
  const Type = x.array(x.string);

  const value1: TypeOf<typeof Type> = ['abc', 'def'];
  const value2: TypeOf<typeof Type> = [];
  const value3 = [123];
  const value4 = 'oops';

  expect(Type.decode(x.json, JSON.stringify(value1))).toEqual(value1);
  expect(Type.decode(x.json, JSON.stringify(value2))).toEqual(value2);
  expect(() => Type.decode(x.json, JSON.stringify(value3)))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      [0] Expected string, getting [object Number]."
  `);
  expect(() => Type.decode(x.json, JSON.stringify(value4))).toThrow(
    TypeConstraintError,
  );

  expect(Type.encode(x.json, value1)).toEqual(JSON.stringify(value1));
  expect(Type.encode(x.json, value2)).toEqual(JSON.stringify(value2));
  expect(() => Type.encode(x.json, value3 as any)).toThrow(TypeConstraintError);
  expect(() => Type.encode(x.json, value4 as any)).toThrow(TypeConstraintError);
});

test('simple array type should work with extended json medium', () => {
  const Type = x.array(x.Date);

  const value1: TypeOf<typeof Type> = [
    new Date('2022-3-31'),
    new Date('2022-4-1'),
  ];
  const value2: TypeOf<typeof Type> = [];
  const value3 = [123];
  const value4 = 'oops';

  expect(Type.decode(x.extendedJSON, JSON.stringify(value1))).toEqual(value1);
  expect(Type.decode(x.extendedJSON, JSON.stringify(value2))).toEqual(value2);
  expect(() => Type.decode(x.extendedJSON, JSON.stringify(value3))).toThrow(
    TypeError,
  );
  expect(() => Type.decode(x.extendedJSON, JSON.stringify(value4)))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expecting unpacked value to be an array, getting [object String]."
  `);

  expect(Type.encode(x.extendedJSON, value1)).toEqual(JSON.stringify(value1));
  expect(Type.encode(x.extendedJSON, value2)).toEqual(JSON.stringify(value2));
  expect(() => Type.encode(x.extendedJSON, value3 as any)).toThrow(
    TypeConstraintError,
  );
  expect(() => Type.encode(x.extendedJSON, value4 as any)).toThrow(
    TypeConstraintError,
  );
});

test('simple array type should work with extended json value medium', () => {
  const Type = x.array(x.Date);

  const value1: TypeOf<typeof Type> = [
    new Date('2022-3-31'),
    new Date('2022-4-1'),
  ];
  const value2: TypeOf<typeof Type> = [];
  const value3 = [123];
  const value4 = 'oops';

  expect(
    Type.decode(
      x.extendedJSONValue,
      value1.map(date => date.toISOString()),
    ),
  ).toEqual(value1);
  expect(
    Type.decode(
      x.extendedJSONValue,
      value2.map(date => date.toISOString()),
    ),
  ).toEqual(value2);
  expect(() => Type.decode(x.extendedJSONValue, value3 as any)).toThrow(
    TypeError,
  );
  expect(() => Type.decode(x.extendedJSONValue, value4 as any)).toThrow(
    TypeConstraintError,
  );

  expect(Type.encode(x.extendedJSONValue, value1)).toEqual(
    JSON.parse(JSON.stringify(value1)),
  );
  expect(Type.encode(x.extendedJSONValue, value2)).toEqual(
    JSON.parse(JSON.stringify(value2)),
  );
  expect(() => Type.encode(x.extendedJSONValue, value3 as any)).toThrow(
    TypeConstraintError,
  );
  expect(() => Type.encode(x.extendedJSONValue, value4 as any)).toThrow(
    TypeConstraintError,
  );
});

test('object array type should work with json medium', () => {
  const Type = x.array(
    x.object({
      foo: x.string,
      bar: x.number,
    }),
  );

  const value1: TypeOf<typeof Type> = [
    {
      foo: 'abc',
      bar: 123,
    },
    {
      foo: 'def',
      bar: 456,
    },
  ];
  const value2: TypeOf<typeof Type> = [];
  const value3 = [123];
  const value4 = 'oops';

  expect(Type.decode(x.json, JSON.stringify(value1))).toEqual(value1);
  expect(Type.decode(x.json, JSON.stringify(value2))).toEqual(value2);
  expect(() => Type.decode(x.json, JSON.stringify(value3)))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      [0] Expecting unpacked value to be a non-null object, getting [object Number]."
  `);
  expect(() => Type.decode(x.json, JSON.stringify(value4))).toThrow(
    TypeConstraintError,
  );

  expect(Type.encode(x.json, value1)).toEqual(JSON.stringify(value1));
  expect(Type.encode(x.json, value2)).toEqual(JSON.stringify(value2));
  expect(() => Type.encode(x.json, value3 as any)).toThrow(TypeConstraintError);
  expect(() => Type.encode(x.json, value4 as any)).toThrow(TypeConstraintError);

  expect(Type.diagnose(value1)).toEqual([]);
  expect(Type.diagnose(value2)).toEqual([]);
  expect(Type.diagnose(value3)).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "Expecting a non-null object, getting [object Number].",
        "path": Array [
          0,
        ],
      },
    ]
  `);
  expect(Type.diagnose(value4)).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "Expecting an array, getting [object String].",
        "path": Array [],
      },
    ]
  `);
});

test('exact with array type should work', () => {
  const Type = x
    .array(
      x.object({
        foo: x.string,
      }),
    )
    .exact();

  const value1 = [{foo: 'abc'}];
  const value2 = [{foo: 'abc'}, {foo: 'def', bar: 123}];

  expect(Type.is(value1)).toBe(true);
  expect(Type.encode(x.json, value1)).toBe(JSON.stringify(value1));
  expect(Type.decode(x.json, JSON.stringify(value1))).toStrictEqual(value1);
  expect(
    Type.transform(x.json, x.jsonValue, JSON.stringify(value1)),
  ).toStrictEqual(value1);

  expect(Type.diagnose(value2)).toMatchInlineSnapshot(`
    Array [
      Object {
        "deferrable": true,
        "message": "Unknown key(s) \\"bar\\".",
        "path": Array [
          1,
        ],
      },
    ]
  `);
  expect(() => Type.encode(x.json, value2)).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      [1] Unknown key(s) \\"bar\\"."
  `);
  expect(() => Type.decode(x.json, JSON.stringify(value2)))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      [1] Unknown key(s) \\"bar\\"."
  `);
  expect(() => Type.transform(x.json, x.jsonValue, JSON.stringify(value2)))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      [1] Unknown key(s) \\"bar\\"."
  `);
});

test('managed exact with array type', () => {
  const R = x
    .array(
      x.object({
        foo: x.string,
      }),
    )
    .refine(value => value)
    .exact();

  const U = x
    .intersection(
      x.array(
        x.object({
          foo: x.string,
        }),
      ),
      x.object({}),
    )
    .exact();

  const valid1 = [{foo: 'abc'}];
  const invalid1 = [{foo: 'abc'}, {foo: 'def', bar: 123}];

  expect(R.is(valid1)).toBe(true);
  expect(R.encode(x.json, valid1)).toBe(JSON.stringify(valid1));
  expect(R.decode(x.json, JSON.stringify(valid1))).toStrictEqual(valid1);
  expect(
    R.transform(x.json, x.jsonValue, JSON.stringify(valid1)),
  ).toStrictEqual(valid1);

  expect(U.is(valid1)).toBe(true);
  expect(U.encode(x.json, valid1)).toBe(JSON.stringify(valid1));
  expect(U.decode(x.json, JSON.stringify(valid1))).toStrictEqual(valid1);
  expect(
    U.transform(x.json, x.jsonValue, JSON.stringify(valid1)),
  ).toStrictEqual(valid1);

  expect(R.diagnose(invalid1)).toMatchInlineSnapshot(`
    Array [
      Object {
        "deferrable": true,
        "message": "Unknown key(s) \\"bar\\".",
        "path": Array [
          1,
        ],
      },
    ]
  `);
  expect(() => R.encode(x.json, invalid1)).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      [1] Unknown key(s) \\"bar\\"."
  `);
  expect(() => R.decode(x.json, JSON.stringify(invalid1)))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      [1] Unknown key(s) \\"bar\\"."
  `);
  expect(() => R.transform(x.json, x.jsonValue, JSON.stringify(invalid1)))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      [1] Unknown key(s) \\"bar\\"."
  `);

  expect(U.diagnose(invalid1)).toMatchInlineSnapshot(`
    Array [
      Object {
        "deferrable": true,
        "message": "Unknown key(s) \\"bar\\".",
        "path": Array [
          1,
        ],
      },
    ]
  `);
  expect(() => U.encode(x.json, invalid1)).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      [1] Unknown key(s) \\"bar\\"."
  `);
  expect(() => U.decode(x.json, JSON.stringify(invalid1)))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      [1] Unknown key(s) \\"bar\\"."
  `);
  expect(() => U.transform(x.json, x.jsonValue, JSON.stringify(invalid1)))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      [1] Unknown key(s) \\"bar\\"."
  `);
});

test('explicit non-exact array', () => {
  const O = x
    .object({
      foo: x
        .array(
          x.object({
            bar: x.string,
          }),
        )
        .exact(false),
    })
    .exact(true);

  const valid1 = {
    foo: [{bar: 'abc'}],
  };

  const valid2 = {
    foo: [{bar: 'abc', oops: 123}],
  };

  const invalid1: any = {
    foo: [{bar: 'abc', oops: 123}],
    extra: true,
  };

  const invalid2: any = {
    foo: 'abc',
  };

  expect(O.is(valid1)).toBe(true);
  expect(O.is(valid2)).toBe(true);

  expect(O.diagnose(invalid1)).toMatchInlineSnapshot(`
    Array [
      Object {
        "deferrable": true,
        "message": "Unknown key(s) \\"extra\\".",
        "path": Array [],
      },
    ]
  `);
  expect(O.diagnose(invalid2)).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "Expecting an array, getting [object String].",
        "path": Array [
          "foo",
        ],
      },
    ]
  `);
});
