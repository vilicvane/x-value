import * as x from '../../library';
import {TypeConstraintError, TypeOf} from '../../library';

it('simple array type should work with built-in json medium', () => {
  const Type = x.array(x.string);

  const value1: TypeOf<typeof Type> = ['abc', 'def'];
  const value2: TypeOf<typeof Type> = [];
  const value3 = [123];
  const value4 = 'oops';

  expect(Type.decode(x.json, JSON.stringify(value1))).toEqual(value1);
  expect(Type.decode(x.json, JSON.stringify(value2))).toEqual(value2);
  expect(() => Type.decode(x.json, JSON.stringify(value3))).toThrow(
    TypeConstraintError,
  );
  expect(() => Type.decode(x.json, JSON.stringify(value4))).toThrow(
    TypeConstraintError,
  );

  expect(Type.encode(x.json, value1));
});
