import * as x from '../library';
import type {TypeOf} from '../library';

test('tuple type should work', () => {
  const Tuple = x.tuple(x.string, x.number);

  const value1: TypeOf<typeof Tuple> = ['abc', 123];
  const value2: any = ['abc', 'def'];
  const value3: any = 123;

  expect(Tuple.decode(x.jsonValue, value1)).toEqual(value1);
  expect(() => Tuple.decode(x.jsonValue, value2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      [1] Expected number, getting [object String]."
  `);
  expect(() => Tuple.decode(x.jsonValue, value3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expecting unpacked value to be an array, getting [object Number]."
  `);

  expect(Tuple.encode(x.jsonValue, value1)).toEqual(value1);
  expect(() => Tuple.encode(x.jsonValue, value2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      [1] Expected number, getting [object String]."
  `);
  expect(() => Tuple.encode(x.jsonValue, value3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Expecting value to be an array, getting [object Number]."
  `);

  expect(Tuple.transform(x.jsonValue, x.json, value1)).toBe(
    JSON.stringify(value1),
  );
  expect(() => Tuple.transform(x.jsonValue, x.json, value2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      [1] Expected number, getting [object String]."
  `);
  expect(() => Tuple.transform(x.jsonValue, x.json, value3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      Expecting unpacked value to be an array, getting [object Number]."
  `);

  expect(Tuple.is(value1)).toBe(true);
  expect(Tuple.is(value2)).toBe(false);
  expect(Tuple.is(value3)).toBe(false);
});
