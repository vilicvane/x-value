import * as x from '../library';
import {TypeOf} from '../library';

it('optional type should work alone', () => {
  const Type = x.optional(x.string);

  const value1: TypeOf<typeof Type> = 'abc';
  const value2: TypeOf<typeof Type> = undefined;
  const value3: any = null;

  expect(Type.decode(x.ecmascript, value1)).toBe(value1);
  expect(Type.decode(x.ecmascript, value2)).toBe(value2);
  expect(() => Type.decode(x.ecmascript, value3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expected string, getting [object Null]."
  `);

  expect(Type.encode(x.ecmascript, value1)).toBe(value1);
  expect(Type.encode(x.ecmascript, value2)).toBe(value2);
  expect(() => Type.encode(x.ecmascript, value3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Expected string, getting [object Null]."
  `);

  expect(Type.transform(x.ecmascript, x.ecmascript, value1)).toBe(value1);
  expect(Type.transform(x.ecmascript, x.ecmascript, value2)).toBe(value2);
  expect(() => Type.transform(x.ecmascript, x.ecmascript, value3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      Expected string, getting [object Null]."
  `);
});
