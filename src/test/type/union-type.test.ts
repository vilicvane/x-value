import * as x from '../../library';
import {TypeConstraintError, TypeOf} from '../../library';

it('union type of atomic types should work with built-in json medium', () => {
  const Type = x.union(x.string, x.number);

  let value1: TypeOf<typeof Type> = 'abc';
  let value2: TypeOf<typeof Type> = 123;

  expect(Type.decode(x.json, JSON.stringify(value1))).toEqual(value1);
  expect(Type.decode(x.json, JSON.stringify(value2))).toEqual(value2);
  expect(() => Type.decode(x.json, JSON.stringify(true))).toThrow(
    TypeConstraintError,
  );

  expect(JSON.parse(Type.encode(x.json, value1))).toEqual(value1);
  expect(JSON.parse(Type.encode(x.json, value2))).toEqual(value2);
  expect(() => Type.encode(x.json, true as any)).toThrow(TypeConstraintError);

  expect(Type.is(value1)).toBe(true);
  expect(Type.is(value2)).toBe(true);
  expect(Type.is(true)).toBe(false);
});

it('union type of mixed types should work with built-in json medium', () => {
  const Type = x.union(
    x.object({
      type: x.literal('text'),
      value: x.string,
    }),
    x.number,
  );

  let value1: TypeOf<typeof Type> = {
    type: 'text',
    value: '123',
  };
  let value2: TypeOf<typeof Type> = 123;
  let value3: any = true;
  let value4: any = {
    type: 'text',
    value: 123,
  };

  expect(Type.decode(x.json, JSON.stringify(value1))).toEqual(value1);
  expect(Type.decode(x.json, JSON.stringify(value2))).toEqual(value2);
  expect(() => Type.decode(x.json, JSON.stringify(true))).toThrow(
    TypeConstraintError,
  );

  expect(JSON.parse(Type.encode(x.json, value1))).toEqual(value1);
  expect(JSON.parse(Type.encode(x.json, value2))).toEqual(value2);
  expect(() => Type.encode(x.json, value3)).toThrow(TypeConstraintError);
  expect(() => Type.encode(x.json, value4)).toThrow(TypeConstraintError);

  expect(Type.is(value1)).toBe(true);
  expect(Type.is(value2)).toBe(true);
  expect(Type.is(value3)).toBe(false);
  expect(Type.is(value4)).toBe(false);
});

it('union type of mixed types should work with built-in json value medium', () => {
  const Type = x.union(
    x.object({
      type: x.literal('text'),
      value: x.string,
    }),
    x.number,
  );

  let value1: TypeOf<typeof Type> = {
    type: 'text',
    value: '123',
  };
  let value2: TypeOf<typeof Type> = 123;
  let value3: any = true;
  let value4: any = {
    type: 'text',
    value: 123,
  };

  expect(Type.decode(x.jsonValue, value1)).toEqual(value1);
  expect(Type.decode(x.jsonValue, value2)).toEqual(value2);
  expect(() => Type.decode(x.jsonValue, true as any)).toThrow(
    TypeConstraintError,
  );

  expect(Type.encode(x.jsonValue, value1)).toEqual(value1);
  expect(Type.encode(x.jsonValue, value2)).toEqual(value2);
  expect(() => Type.encode(x.jsonValue, value3)).toThrow(TypeConstraintError);
  expect(() => Type.encode(x.jsonValue, value4)).toThrow(TypeConstraintError);
});
