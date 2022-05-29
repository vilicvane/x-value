import type {AssertTrue, IsEqual} from 'tslang';

import * as x from '../library';
import type {TypeOf} from '../library';
import {TypeConstraintError} from '../library';

test('simple object type should work with json medium', () => {
  const Type = x.object({
    id: x.string,
    name: x.string,
    age: x.number,
  });

  const value: TypeOf<typeof Type> = {
    id: 'abc',
    name: 'hello',
    age: 0,
  };

  expect(
    Type.decode(
      x.json,
      JSON.stringify({
        ...value,
        wild: 'oops',
      }),
    ),
  ).toEqual(value);

  expect(Type.encode(x.json, value)).toEqual(JSON.stringify(value));
  expect(
    Type.encode(x.json, {
      ...value,
      wild: 'oops',
    } as any),
  ).toEqual(JSON.stringify(value));

  expect(() => Type.encode(x.json, {} as any)).toThrow(TypeConstraintError);

  expect(Type.is(value)).toBe(true);
  expect(Type.is({})).toBe(false);
  expect(Type.is(123)).toBe(false);
});

test('nested object type should decode extended json medium', () => {
  const Type = x.object({
    id: x.string,
    profile: x.object({
      name: x.string,
      age: x.number,
    }),
    date: x.Date,
  });

  const value: TypeOf<typeof Type> = {
    id: 'abc',
    profile: {
      name: 'hello',
      age: 0,
    },
    // JSON.stringify will turn this into string
    date: new Date(),
  };

  expect(
    Type.decode(
      x.extendedJSON,
      JSON.stringify({
        ...value,
        wild: 'oops',
      }),
    ),
  ).toEqual(value);

  expect(Type.is(value)).toBe(true);
});

test('object type with optional property should work with json medium', () => {
  const Type = x.object({
    id: x.string,
    profile: x.object({
      name: x.string,
      age: x.number.optional(),
    }),
  });

  const value: TypeOf<typeof Type> = {
    id: 'abc',
    profile: {
      name: 'hello',
    },
  };

  expect(
    Type.decode(
      x.json,
      JSON.stringify({
        ...value,
        wild: 'oops',
      }),
    ),
  ).toEqual(value);
  expect(() =>
    Type.decode(
      x.json,
      JSON.stringify({
        ...value,
        profile: {
          ...value.profile,
          age: 'invalid',
        },
      }),
    ),
  ).toThrow(TypeConstraintError);

  expect(Type.encode(x.json, value)).toBe(JSON.stringify(value));
  expect(Type.encode(x.json, {...value, wild: 'oops'} as any)).toBe(
    JSON.stringify(value),
  );
  expect(() =>
    Type.encode(x.json, {
      ...value,
      profile: {
        ...value.profile,
        age: 'invalid',
      },
    } as any),
  ).toThrow(TypeConstraintError);

  expect(Type.is(value)).toBe(true);
  expect(
    Type.is({
      ...value,
      profile: {
        ...value.profile,
        age: 'invalid',
      },
    }),
  ).toBe(false);
});

test('object type with union type property should work with json medium', () => {
  const Type = x.object({
    id: x.string,
    profile: x.union(
      x.object({
        version: x.literal(1),
        name: x.string,
        age: x.number.optional(),
      }),
      x.object({
        version: x.literal(2),
        displayName: x.string,
        age: x.number.optional(),
      }),
    ),
  });

  const value1: TypeOf<typeof Type> = {
    id: 'abc',
    profile: {
      version: 1,
      name: 'hello',
    },
  };

  const value2: TypeOf<typeof Type> = {
    id: 'abc',
    profile: {
      version: 2,
      displayName: 'hello',
      age: 2,
    },
  };

  const value3 = {
    id: 'abc',
    profile: {
      version: 1,
      displayName: 'hello',
      age: 2,
    },
  };

  expect(Type.decode(x.json, JSON.stringify(value1))).toEqual(value1);
  expect(Type.decode(x.json, JSON.stringify(value2))).toEqual(value2);
  expect(() => Type.decode(x.json, JSON.stringify(value3))).toThrow(
    TypeConstraintError,
  );

  expect(Type.encode(x.json, value1)).toEqual(JSON.stringify(value1));
  expect(Type.encode(x.json, value2)).toEqual(JSON.stringify(value2));
  expect(() => Type.encode(x.json, value3 as any)).toThrow(TypeConstraintError);

  expect(Type.is(value1)).toBe(true);
  expect(Type.is(value2)).toBe(true);
  expect(Type.is(value3)).toBe(false);
});

test('object type with intersection type property should work with json medium', () => {
  const Type = x.object({
    id: x.string,
    profile: x.intersection(
      x.object({
        name: x.string,
        age: x.number.optional(),
      }),
      x.object({
        displayName: x.string,
        gender: x.union(x.literal('male'), x.literal('female')),
      }),
    ),
  });

  type Type = TypeOf<typeof Type>;

  type Gender = Type['profile']['gender'];

  type _ = AssertTrue<IsEqual<Gender, 'male' | 'female'>>;

  const value1: TypeOf<typeof Type> = {
    id: 'abc',
    profile: {
      name: 'hello',
      displayName: 'Hello',
      age: 18,
      gender: 'male',
    },
  };

  const value2: TypeOf<typeof Type> = {
    id: 'abc',
    profile: {
      name: 'world',
      displayName: 'World',
      gender: 'female',
    },
  };

  const value3 = {
    id: 'abc',
    profile: {
      name: 'hello',
      displayName: 'Hello',
      age: '18',
      gender: 'male',
    },
  };

  expect(Type.decode(x.json, JSON.stringify(value1))).toEqual(value1);
  expect(Type.decode(x.json, JSON.stringify(value2))).toEqual(value2);
  expect(() => Type.decode(x.json, JSON.stringify(value3))).toThrow(
    TypeConstraintError,
  );

  expect(JSON.parse(Type.encode(x.json, value1))).toEqual(value1);
  expect(JSON.parse(Type.encode(x.json, value2))).toEqual(value2);
  expect(() => Type.encode(x.json, value3 as any)).toThrow(TypeConstraintError);

  expect(Type.is(value1)).toBe(true);
  expect(Type.is(value2)).toBe(true);
  expect(Type.is(value3)).toBe(false);
});

test('partial() should work', () => {
  const O = x.object({
    foo: x.string,
    bar: x.number.optional(),
  });

  const PartialO = O.partial();

  type PartialO = TypeOf<typeof PartialO>;

  expect(PartialO.is({foo: 'abc', bar: 123})).toBe(true);
  expect(PartialO.is({bar: 123})).toBe(true);
  expect(PartialO.is({foo: 'abc'})).toBe(true);
  expect(PartialO.is({})).toBe(true);
  expect(PartialO.is(123)).toBe(false);

  expect(PartialO.encode(x.jsonValue, {bar: 123})).toEqual({bar: 123});
  expect(PartialO.encode(x.jsonValue, {foo: 'abc'})).toEqual({foo: 'abc'});
  expect(
    PartialO.encode(x.jsonValue, {foo: 'abc', extra: true} as any),
  ).toEqual({foo: 'abc'});

  expect(PartialO.decode(x.jsonValue, {bar: 123})).toEqual({bar: 123});
  expect(PartialO.decode(x.jsonValue, {foo: 'abc'})).toEqual({foo: 'abc'});
  expect(
    PartialO.decode(x.jsonValue, {foo: 'abc', extra: true} as any),
  ).toEqual({foo: 'abc'});

  type _ = AssertTrue<IsEqual<PartialO, {foo?: string; bar?: number}>>;
});

test('pick() should work', () => {
  const O = x.object({
    foo: x.string,
    bar: x.number.optional(),
    extra: x.boolean,
  });

  const PickedO = O.pick('foo', 'bar');

  type PickedO = TypeOf<typeof PickedO>;

  expect(PickedO.is({foo: 'abc', bar: 123})).toBe(true);
  expect(PickedO.is({bar: 123})).toBe(false);
  expect(PickedO.is({foo: 'abc'})).toBe(true);
  expect(PickedO.is({})).toBe(false);
  expect(PickedO.is(123)).toBe(false);

  expect(PickedO.encode(x.jsonValue, {foo: 'abc'})).toEqual({foo: 'abc'});
  expect(PickedO.encode(x.jsonValue, {foo: 'abc', extra: true} as any)).toEqual(
    {foo: 'abc'},
  );

  expect(PickedO.decode(x.jsonValue, {foo: 'abc'})).toEqual({foo: 'abc'});
  expect(PickedO.decode(x.jsonValue, {foo: 'abc', extra: true} as any)).toEqual(
    {foo: 'abc'},
  );

  type _ = AssertTrue<
    IsEqual<TypeOf<typeof PickedO>, {foo: string; bar?: number}>
  >;
});

test('omit() should work', () => {
  const O = x.object({
    foo: x.string,
    bar: x.number.optional(),
    extra: x.boolean,
  });

  const OmittedO = O.omit('extra');

  type OmittedO = TypeOf<typeof OmittedO>;

  expect(OmittedO.is({foo: 'abc', bar: 123})).toBe(true);
  expect(OmittedO.is({bar: 123})).toBe(false);
  expect(OmittedO.is({foo: 'abc'})).toBe(true);
  expect(OmittedO.is({})).toBe(false);
  expect(OmittedO.is(123)).toBe(false);

  expect(OmittedO.encode(x.jsonValue, {foo: 'abc'})).toEqual({foo: 'abc'});
  expect(
    OmittedO.encode(x.jsonValue, {foo: 'abc', extra: true} as any),
  ).toEqual({foo: 'abc'});

  expect(OmittedO.decode(x.jsonValue, {foo: 'abc'})).toEqual({foo: 'abc'});
  expect(
    OmittedO.decode(x.jsonValue, {foo: 'abc', extra: true} as any),
  ).toEqual({foo: 'abc'});

  type _ = AssertTrue<
    IsEqual<TypeOf<typeof OmittedO>, {foo: string; bar?: number}>
  >;
});

test('undefined with json should work as expected', () => {
  const O = x.object({
    foo: x.union(x.string, x.undefined),
  });

  expect(O.is({foo: undefined})).toBe(true);
  expect(O.encode(x.json, {foo: undefined})).toBe('{}');
  expect(O.decode(x.json, '{}')).toStrictEqual({foo: undefined});
});

test('literal property type should be correct', () => {
  const O = x.object({
    type: x.literal('foo'),
  });

  type O = TypeOf<typeof O>;

  type _ = AssertTrue<IsEqual<O['type'], 'foo'>>;
});

test('object shallow exact type should work', () => {
  const O = x
    .object({
      foo: x.string,
      bar: x.number.optional(),
    })
    .exact();

  const NonExactO = O.exact(false);

  type O = TypeOf<typeof O>;

  let value1 = {foo: 'abc', bar: 123};

  let value2 = {foo: 'abc', bar: 123, x: true, y: {}};

  expect(O.is(value1)).toBe(true);
  expect(() => O.encode(x.json, value2)).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Unknown key(s) \\"x\\", \\"y\\"."
  `);
  expect(() => O.decode(x.json, JSON.stringify(value2)))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Unknown key(s) \\"x\\", \\"y\\"."
  `);
  expect(() => O.transform(x.json, x.jsonValue, JSON.stringify(value2)))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      Unknown key(s) \\"x\\", \\"y\\"."
  `);
  expect(O.diagnose({foo: 'abc', bar: 123, extra: true}))
    .toMatchInlineSnapshot(`
    Array [
      Object {
        "fatal": false,
        "message": "Unknown key(s) \\"extra\\".",
        "path": Array [],
      },
    ]
  `);

  expect(NonExactO.is(value2)).toBe(true);

  type _ = AssertTrue<IsEqual<O, {foo: string; bar?: number}>>;
});

test('object nested exact should work', () => {
  const O = x
    .object({
      foo: x.string,
      bar: x.object({
        yo: x.number,
        ha: x
          .union(
            x.string,
            x.object({
              x: x.number,
              y: x.number,
              oops: x
                .object({
                  z: x.number,
                })
                .exact(false),
            }),
          )
          .optional(),
      }),
    })
    .exact();

  const value1 = {
    foo: 'abc',
    bar: {
      yo: 123,
      ha: 'def',
    },
  };

  const value2 = {
    foo: 'abc',
    bar: {
      yo: 123,
      ha: {
        x: 1,
        y: 2,
        oops: {
          z: 3,
          extra: 1,
        },
      },
    },
  };

  const value2WithOutExtra = {
    foo: 'abc',
    bar: {
      yo: 123,
      ha: {
        x: 1,
        y: 2,
        oops: {
          z: 3,
        },
      },
    },
  };

  const value3 = {
    foo: 'abc',
    bar: {
      yo: 123,
      ha: 'def',
      extra: '!',
    },
  };

  const value4 = {
    foo: 'abc',
    bar: {
      yo: 123,
      ha: {
        x: 1,
        y: 2,
        extra1: 3,
        extra2: 4,
        oops: {
          z: 3,
        },
      },
    },
  };

  expect(O.is(value1)).toBe(true);
  expect(O.is(value2)).toBe(true);
  expect(O.encode(x.jsonValue, value1)).toStrictEqual(value1);
  expect(O.encode(x.jsonValue, value2)).toStrictEqual(value2WithOutExtra);
  expect(O.decode(x.jsonValue, value1)).toStrictEqual(value1);
  expect(O.decode(x.jsonValue, value2)).toStrictEqual(value2WithOutExtra);
  expect(O.transform(x.jsonValue, x.json, value1)).toBe(JSON.stringify(value1));
  expect(O.transform(x.jsonValue, x.json, value2)).toBe(
    JSON.stringify(value2WithOutExtra),
  );

  expect(O.diagnose(value3)).toMatchInlineSnapshot(`
    Array [
      Object {
        "fatal": false,
        "message": "Unknown key(s) \\"extra\\".",
        "path": Array [
          "bar",
        ],
      },
    ]
  `);
  expect(O.diagnose(value4)).toMatchInlineSnapshot(`
    Array [
      Object {
        "fatal": false,
        "message": "Unknown key(s) \\"extra1\\", \\"extra2\\".",
        "path": Array [
          "bar",
          "ha",
        ],
      },
    ]
  `);
  expect(() => O.encode(x.json, value3)).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      [\\"bar\\"] Unknown key(s) \\"extra\\"."
  `);
  expect(() => O.encode(x.json, value4)).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      [\\"bar\\"][\\"ha\\"] Unknown key(s) \\"extra1\\", \\"extra2\\"."
  `);
  expect(() => O.decode(x.jsonValue, value3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      [\\"bar\\"] Unknown key(s) \\"extra\\"."
  `);
  expect(() => O.decode(x.jsonValue, value4))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      [\\"bar\\"][\\"ha\\"] Unknown key(s) \\"extra1\\", \\"extra2\\"."
  `);
  expect(() => O.transform(x.jsonValue, x.json, value3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      [\\"bar\\"] Unknown key(s) \\"extra\\"."
  `);
  expect(() => O.transform(x.jsonValue, x.json, value4))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      [\\"bar\\"][\\"ha\\"] Unknown key(s) \\"extra1\\", \\"extra2\\"."
  `);
});

test('explicit non-exact object with intersection', () => {
  const O = x
    .intersection(
      x
        .object({
          foo: x.string,
        })
        .exact(false),
      x.object({
        bar: x.number,
      }),
    )
    .exact(true);

  const valid1: any = {
    foo: 'abc',
    bar: 123,
    extra: 1,
  };

  const invalid1: any = {
    bar: 123,
  };

  expect(O.is(valid1)).toBe(true);

  expect(O.diagnose(invalid1)).toMatchInlineSnapshot(`
    Array [
      Object {
        "fatal": true,
        "message": "Expected string, getting [object Undefined].",
        "path": Array [
          "foo",
        ],
      },
    ]
  `);
});
