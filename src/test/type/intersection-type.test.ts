import * as x from '../../library';
import {TypeConstraintError, TypeOf} from '../../library';

it('intersection type results in never should work with built-in json medium', () => {
  const Type = x.intersection(x.string, x.number);

  let value1 = 'abc';
  let value2 = 123;

  expect(() => Type.decode(x.json, JSON.stringify(value1))).toThrow(
    TypeConstraintError,
  );
  expect(() => Type.decode(x.json, JSON.stringify(value2))).toThrow(
    TypeConstraintError,
  );

  expect(Type.is(value1)).toBe(false);
  expect(Type.is(value2)).toBe(false);
});

it('intersection type should work with built-in json medium', () => {
  const Type = x.intersection(
    x.object({
      foo: x.string,
    }),
    x.object({
      bar: x.number,
    }),
  );

  let value1: TypeOf<typeof Type> = {
    foo: 'abc',
    bar: 123,
  };
  let value2 = {
    foo: 'abc',
  };
  let value3 = {
    foo: 'abc',
    bar: 'def',
  };

  expect(Type.decode(x.json, JSON.stringify(value1))).toEqual(value1);
  expect(() => Type.decode(x.json, JSON.stringify(value2))).toThrow(
    TypeConstraintError,
  );
  expect(() => Type.decode(x.json, JSON.stringify(value3))).toThrow(
    TypeConstraintError,
  );

  expect(Type.is(value1)).toBe(true);
  expect(Type.is(value2)).toBe(false);
  expect(Type.is(value3)).toBe(false);
});