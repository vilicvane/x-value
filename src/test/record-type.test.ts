import * as x from '../library';
import type {TypeOf} from '../library';

test('record type with string key should work', () => {
  const Type = x.record(x.string, x.number);

  const value1: TypeOf<typeof Type> = {
    x: 1,
    y: 2,
  };

  const value2: TypeOf<typeof Type> = {};

  const value3: any = {
    key: 'invalid value',
  };

  const value4: any = 123;

  expect(Type.decode(x.jsonValue, value1)).toStrictEqual(value1);
  expect(Type.decode(x.jsonValue, value2)).toStrictEqual(value2);
  expect(() => Type.decode(x.jsonValue, value3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      [\\"key\\"] Expected number, getting [object String]."
  `);
  expect(() => Type.decode(x.jsonValue, value4))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expecting unpacked value to be a non-null object, getting [object Number]."
  `);

  expect(Type.encode(x.jsonValue, value1)).toStrictEqual(value1);
  expect(Type.encode(x.jsonValue, value2)).toStrictEqual(value2);
  expect(() => Type.encode(x.jsonValue, value3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      [\\"key\\"] Expected number, getting [object String]."
  `);
  expect(() => Type.encode(x.jsonValue, value4))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Expecting value to be a non-null object, getting [object Number]."
  `);

  expect(Type.transform(x.jsonValue, x.json, value1)).toStrictEqual(
    JSON.stringify(value1),
  );
  expect(Type.transform(x.jsonValue, x.json, value2)).toStrictEqual(
    JSON.stringify(value2),
  );
  expect(() => Type.transform(x.jsonValue, x.json, value3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      [\\"key\\"] Expected number, getting [object String]."
  `);
  expect(() => Type.transform(x.jsonValue, x.json, value4))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      Expecting unpacked value to be a non-null object, getting [object Number]."
  `);

  expect(Type.is({})).toBe(true);
  expect(Type.is({foo: 123, bar: 456})).toBe(true);
  expect(Type.is({key: 'abc'})).toBe(false);
  expect(Type.is(null)).toBe(false);
});

test('record type with number key should work', () => {
  const Type = x.record(x.number, x.string);

  const value1: TypeOf<typeof Type> = ['abc', 'def'];

  const value2: TypeOf<typeof Type> = [];

  const value3: any = {
    'invalid key': 'invalid value',
  };

  const value4: any = 123;

  expect(Type.decode(x.jsonValue, value1)).toStrictEqual(value1);
  expect(Type.decode(x.jsonValue, value2)).toStrictEqual(value2);
  expect(() => Type.decode(x.jsonValue, value3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      [key:\\"invalid key\\"] Expected number, getting [object String]."
  `);
  expect(() => Type.decode(x.jsonValue, value4))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expecting unpacked value to be a non-null object, getting [object Number]."
  `);

  expect(Type.encode(x.jsonValue, value1)).toStrictEqual(value1);
  expect(Type.encode(x.jsonValue, value2)).toStrictEqual(value2);
  expect(() => Type.encode(x.jsonValue, value3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      [key:\\"invalid key\\"] Expected number, getting [object String]."
  `);
  expect(() => Type.encode(x.jsonValue, value4))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Expecting value to be a non-null object, getting [object Number]."
  `);

  expect(Type.transform(x.jsonValue, x.json, value1)).toStrictEqual(
    JSON.stringify(value1),
  );
  expect(Type.transform(x.jsonValue, x.json, value2)).toStrictEqual(
    JSON.stringify(value2),
  );
  expect(() => Type.transform(x.jsonValue, x.json, value3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      [key:\\"invalid key\\"] Expected number, getting [object String]."
  `);
  expect(() => Type.transform(x.jsonValue, x.json, value4))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      Expecting unpacked value to be a non-null object, getting [object Number]."
  `);

  expect(Type.is([])).toBe(true);
  expect(Type.is(['abc', 'def'])).toBe(true);
  expect(Type.is({'invalid key': 'abc'})).toBe(false);
  expect(Type.is(null)).toBe(false);
});

test('record type with nominal string key should work', () => {
  const Email = x.string.refine<string & {_nominal: 'email'}>(
    value => value.includes('@') || 'Expected an email address.',
  );

  const Type = x.record(Email, x.string);

  const value1: TypeOf<typeof Type> = {
    ['hello@world' as string & {_nominal: 'email'}]: 'oops',
  };

  const value2 = {
    'invalid key': 'yoha',
  };

  expect(Type.decode(x.jsonValue, value1)).toStrictEqual(value1);
  expect(() => Type.decode(x.jsonValue, value2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      [key:\\"invalid key\\"] Expected an email address."
  `);

  expect(Type.encode(x.jsonValue, value1)).toStrictEqual(value1);
  expect(() => Type.encode(x.jsonValue, value2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      [key:\\"invalid key\\"] Expected an email address."
  `);

  expect(Type.transform(x.jsonValue, x.json, value1)).toStrictEqual(
    JSON.stringify(value1),
  );
  expect(() => Type.transform(x.jsonValue, x.json, value2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      [key:\\"invalid key\\"] Expected an email address."
  `);
});

test('record type with union string key should work', () => {
  const Email = x.string.refine<string & {_nominal: 'email'}>(
    value => value.includes('@') || 'Expected an email address.',
  );

  const Type = x.record(x.union(x.literal('foo'), Email), x.string);

  const email = 'hello@world' as TypeOf<typeof Email>;

  const value1: TypeOf<typeof Type> = {
    foo: 'oops',
    [email]: 'oops',
  };

  const value2 = {
    foo: 'oops',
    'invalid key': 'yoha',
  };

  const value3: any = {foo: 1};

  expect(Type.decode(x.jsonValue, value1)).toStrictEqual(value1);
  expect(() => Type.decode(x.jsonValue, value2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      [key:\\"invalid key\\"] Expected string \\"foo\\", getting \\"invalid key\\"."
  `);
  expect(() => Type.decode(x.jsonValue, value3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      [\\"foo\\"] Expected string, getting [object Number]."
  `);

  expect(Type.encode(x.jsonValue, value1)).toStrictEqual(value1);
  expect(() => Type.encode(x.jsonValue, value2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      [key:\\"invalid key\\"] Expected string \\"foo\\", getting \\"invalid key\\"."
  `);
  expect(() => Type.encode(x.jsonValue, value3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      [\\"foo\\"] Expected string, getting [object Number]."
  `);

  expect(Type.transform(x.jsonValue, x.json, value1)).toStrictEqual(
    JSON.stringify(value1),
  );
  expect(() => Type.transform(x.jsonValue, x.json, value2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      [key:\\"invalid key\\"] Expected string \\"foo\\", getting \\"invalid key\\"."
  `);
  expect(() => Type.transform(x.jsonValue, x.json, value3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      [\\"foo\\"] Expected string, getting [object Number]."
  `);
});
