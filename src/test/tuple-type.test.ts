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

test('exact with tuple type should work', () => {
  const Tuple = x
    .tuple(
      x.string,
      x.object({
        foo: x.string,
        bar: x.number,
      }),
    )
    .exact();

  type Tuple = x.TypeOf<typeof Tuple>;

  const valid1: Tuple = [
    'hello',
    {
      foo: 'abc',
      bar: 123,
    },
  ];

  const invalid1: any = [
    'hello',
    {
      foo: 'abc',
      bar: 123,
      extra: true,
    },
  ];

  expect(Tuple.is(valid1)).toBe(true);
  expect(Tuple.encode(x.jsonValue, valid1)).toEqual(valid1);
  expect(Tuple.decode(x.jsonValue, valid1)).toEqual(valid1);
  expect(Tuple.transform(x.jsonValue, x.json, valid1)).toBe(
    JSON.stringify(valid1),
  );

  expect(Tuple.diagnose(invalid1)).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "Unknown key(s) \\"extra\\".",
        "path": Array [
          1,
        ],
      },
    ]
  `);
  expect(() => Tuple.encode(x.json, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      [1] Unknown key(s) \\"extra\\"."
  `);
  expect(() => Tuple.decode(x.jsonValue, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      [1] Unknown key(s) \\"extra\\"."
  `);
  expect(() => Tuple.transform(x.jsonValue, x.json, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      [1] Unknown key(s) \\"extra\\"."
  `);
});
