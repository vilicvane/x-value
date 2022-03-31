import * as x from '../../library';
import {TypeConstraintError, TypeOf} from '../../library';
import {extendedJSON} from '../@usage';

it('simple object type should decode built-in json medium', () => {
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
      extendedJSON,
      JSON.stringify({
        ...value,
        wild: 'oops',
      }),
    ),
  ).toEqual(value);

  expect(Type.is(value)).toBe(true);
});

it('object type with optional property should work with built-in json medium', () => {
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

it('object type with union type property should work with built-in json medium', () => {
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

  expect(Type.is(value1)).toBe(true);
  expect(Type.is(value2)).toBe(true);
  expect(Type.is(value3)).toBe(false);
});

it('object type with intersection type property should work with built-in json medium', () => {
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

  expect(Type.is(value1)).toBe(true);
  expect(Type.is(value2)).toBe(true);
  expect(Type.is(value3)).toBe(false);
});
