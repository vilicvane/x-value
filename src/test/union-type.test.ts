import * as x from '../library';

test('union type of atomic types should work with json medium', () => {
  const Type = x.union([x.string, x.number]);

  const value1: x.TypeOf<typeof Type> = 'abc';
  const value2: x.TypeOf<typeof Type> = 123;

  expect(Type.decode(x.json, JSON.stringify(value1))).toEqual(value1);
  expect(Type.decode(x.json, JSON.stringify(value2))).toEqual(value2);
  expect(() => Type.decode(x.json, JSON.stringify(true)))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      The value satisfies none of the type in the union type.
      Expected string, got [object Boolean]."
  `);

  expect(JSON.parse(Type.encode(x.json, value1))).toEqual(value1);
  expect(JSON.parse(Type.encode(x.json, value2))).toEqual(value2);
  // @ts-expect-error
  expect(() => Type.encode(x.json, true)).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      The value satisfies none of the type in the union type.
      Expected string, got [object Boolean]."
  `);

  expect(Type.is(value1)).toBe(true);
  expect(Type.is(value2)).toBe(true);
  expect(Type.is(true)).toBe(false);
});

test('union type property with undefined', () => {
  const Type = x.object({
    value: x.union([x.string, x.undefined]),
  });

  type Type = x.TypeOf<typeof Type>;

  const _value_1: Type = {value: 'abc'};
  const _value_2: Type = {value: undefined};
});

test('union type of mixed types should work with json medium', () => {
  const Type = x.union([
    x.object({
      type: x.literal('text'),
      value: x.string,
    }),
    x.number,
  ]);

  const value1: x.TypeOf<typeof Type> = {
    type: 'text',
    value: '123',
  };
  const value2: x.TypeOf<typeof Type> = 123;
  const value3: any = true;
  const value4: any = {
    type: 'text',
    value: 123,
  };

  expect(Type.decode(x.json, JSON.stringify(value1))).toEqual(value1);
  expect(Type.decode(x.json, JSON.stringify(value2))).toEqual(value2);
  expect(() => Type.decode(x.json, JSON.stringify(true)))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      The value satisfies none of the type in the union type.
      Expected a non-null object, got [object Boolean]."
  `);

  expect(JSON.parse(Type.encode(x.json, value1))).toEqual(value1);
  expect(JSON.parse(Type.encode(x.json, value2))).toEqual(value2);
  expect(() => Type.encode(x.json, value3)).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      The value satisfies none of the type in the union type.
      Expected a non-null object, got [object Boolean]."
  `);
  expect(() => Type.encode(x.json, value4)).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      The value satisfies none of the type in the union type.
      ["value"] Expected string, got [object Number]."
  `);

  expect(Type.is(value1)).toBe(true);
  expect(Type.is(value2)).toBe(true);
  expect(Type.is(value3)).toBe(false);
  expect(Type.is(value4)).toBe(false);
});

test('union type of mixed types should work with json value medium', () => {
  const Type = x.union([
    x.object({
      type: x.literal('text'),
      value: x.string,
    }),
    x.number,
  ]);

  const value1: x.TypeOf<typeof Type> = {
    type: 'text',
    value: '123',
  };
  const value2: x.TypeOf<typeof Type> = 123;
  const value3: any = true;
  const value4: any = {
    type: 'text',
    value: 123,
  };

  expect(Type.decode(x.jsonValue, value1)).toEqual(value1);
  expect(Type.decode(x.jsonValue, value2)).toEqual(value2);
  expect(() => Type.decode(x.jsonValue, value3)).toThrow(x.TypeConstraintError);
  expect(() => Type.decode(x.jsonValue, value4)).toThrow(x.TypeConstraintError);

  expect(Type.encode(x.jsonValue, value1)).toEqual(value1);
  expect(Type.encode(x.jsonValue, value2)).toEqual(value2);
  expect(() => Type.encode(x.jsonValue, value3)).toThrow(x.TypeConstraintError);
  expect(() => Type.encode(x.jsonValue, value4)).toThrow(x.TypeConstraintError);
});

test('exact with union type', () => {
  const Type = x
    .union([
      x.object({
        type: x.literal('a'),
      }),
      x.intersection([
        x.object({
          type: x.literal('b'),
        }),
        x.object({
          foo: x.string,
        }),
        x.object({
          bar: x.number,
        }),
      ]),
    ])
    .exact();

  type Type = x.TypeOf<typeof Type>;

  const valid1: Type = {
    type: 'a',
  };

  const valid2: Type = {
    type: 'b',
    foo: 'abc',
    bar: 123,
  };

  const invalid1: any = {
    type: 'a',
    extra: true,
  };

  const invalid2: any = {
    type: 'b',
    foo: 'abc',
    bar: 123,
    extra: true,
  };

  expect(Type.is(valid1)).toBe(true);
  expect(Type.is(valid2)).toBe(true);
  expect(Type.encode(x.jsonValue, valid1)).toEqual(valid1);
  expect(Type.encode(x.jsonValue, valid2)).toEqual(valid2);
  expect(Type.decode(x.jsonValue, valid1)).toEqual(valid1);
  expect(Type.decode(x.jsonValue, valid2)).toEqual(valid2);
  expect(Type.transform(x.jsonValue, x.json, valid1)).toBe(
    JSON.stringify(valid1),
  );
  expect(Type.transform(x.jsonValue, x.json, valid2)).toBe(
    JSON.stringify(valid2),
  );

  expect(Type.diagnose(invalid1)).toMatchInlineSnapshot(`
    [
      {
        "deferrable": true,
        "message": "Unknown key(s) "extra".",
        "path": [],
      },
    ]
  `);
  expect(Type.diagnose(invalid2)).toMatchInlineSnapshot(`
    [
      {
        "deferrable": true,
        "message": "Unknown key(s) "extra".",
        "path": [],
      },
    ]
  `);
  expect(() => Type.encode(x.json, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Unknown key(s) "extra"."
  `);
  expect(() => Type.encode(x.json, invalid2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Unknown key(s) "extra"."
  `);
  expect(() => Type.decode(x.jsonValue, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Unknown key(s) "extra"."
  `);
  expect(() => Type.decode(x.jsonValue, invalid2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Unknown key(s) "extra"."
  `);
  expect(() => Type.transform(x.jsonValue, x.json, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      Unknown key(s) "extra"."
  `);
  expect(() => Type.transform(x.jsonValue, x.json, invalid2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      Unknown key(s) "extra"."
  `);
});
