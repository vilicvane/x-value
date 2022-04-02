import * as x from '../library';
import {TypeOf} from '../library';

it('record type with string key should work', () => {
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

  expect(Type.convert(x.jsonValue, x.json, value1)).toStrictEqual(
    JSON.stringify(value1),
  );
  expect(Type.convert(x.jsonValue, x.json, value2)).toStrictEqual(
    JSON.stringify(value2),
  );
  expect(() => Type.convert(x.jsonValue, x.json, value3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to convert medium:
      [\\"key\\"] Expected number, getting [object String]."
  `);
  expect(() => Type.convert(x.jsonValue, x.json, value4))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to convert medium:
      Expecting unpacked value to be a non-null object, getting [object Number]."
  `);

  expect(Type.is({})).toBe(true);
  expect(Type.is({foo: 123, bar: 456})).toBe(true);
  expect(Type.is({key: 'abc'})).toBe(false);
  expect(Type.is(null)).toBe(false);
});

it('record type with number key should work', () => {
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

  expect(Type.convert(x.jsonValue, x.json, value1)).toStrictEqual(
    JSON.stringify(value1),
  );
  expect(Type.convert(x.jsonValue, x.json, value2)).toStrictEqual(
    JSON.stringify(value2),
  );
  expect(() => Type.convert(x.jsonValue, x.json, value3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to convert medium:
      [key:\\"invalid key\\"] Expected number, getting [object String]."
  `);
  expect(() => Type.convert(x.jsonValue, x.json, value4))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to convert medium:
      Expecting unpacked value to be a non-null object, getting [object Number]."
  `);

  expect(Type.is([])).toBe(true);
  expect(Type.is(['abc', 'def'])).toBe(true);
  expect(Type.is({'invalid key': 'abc'})).toBe(false);
  expect(Type.is(null)).toBe(false);
});

it('record type with nominal string key should work', () => {
  const Email = x.string.refine<string & {_nominal: 'email'}>(value =>
    value.includes('@') ? true : 'Expected an email address.',
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

  expect(Type.convert(x.jsonValue, x.json, value1)).toStrictEqual(
    JSON.stringify(value1),
  );
  expect(() => Type.convert(x.jsonValue, x.json, value2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to convert medium:
      [key:\\"invalid key\\"] Expected an email address."
  `);
});
