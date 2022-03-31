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

  expect(Type.is(value1)).toBe(true);
  expect(Type.is(value2)).toBe(true);
  expect(Type.is(true)).toBe(false);
});
