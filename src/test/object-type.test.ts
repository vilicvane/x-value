import type {AssertTrue, IsEqual} from 'tslang';

import * as x from '../library';
import type {TypeOf} from '../library';
import {TypeConstraintError} from '../library';

it('simple object type should work with json medium', () => {
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

it('nested object type should decode extended json medium', () => {
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

it('object type with optional property should work with json medium', () => {
  const Type = x.object({
    id: x.string,
    profile: x.object({
      name: x.string,
      age: x.optional(x.number),
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

it('object type with union type property should work with json medium', () => {
  const Type = x.object({
    id: x.string,
    profile: x.union(
      x.object({
        version: x.literal(1),
        name: x.string,
        age: x.optional(x.number),
      }),
      x.object({
        version: x.literal(2),
        displayName: x.string,
        age: x.optional(x.number),
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

it('object type with intersection type property should work with json medium', () => {
  const Type = x.object({
    id: x.string,
    profile: x.intersection(
      x.object({
        name: x.string,
        age: x.optional(x.number),
      }),
      x.object({
        displayName: x.string,
        gender: x.union(x.literal('male'), x.literal('female')),
      }),
    ),
  });

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
    bar: x.optional(x.number),
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
    bar: x.optional(x.number),
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
    bar: x.optional(x.number),
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
