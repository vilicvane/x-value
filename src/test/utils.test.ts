import type {AssertTrue, IsEqual} from 'tslang';

import * as x from '../library';
import type {Nominal, TypeOf} from '../library';
import {Integer, integerRange, numberRange} from '../library';

test('UnknownRecord type should work', () => {
  expect(x.UnknownRecord.is({})).toBe(true);
  expect(x.UnknownRecord.is({key: 'value'})).toBe(true);
  expect(x.UnknownRecord.is([])).toBe(true);
  expect(x.UnknownRecord.is(() => {})).toBe(false);

  let value = {hello: ['world', '!']};

  expect(x.UnknownRecord.decode(x.json, JSON.stringify(value))).toEqual({
    hello: ['world', '!'],
  });
});

test('Integer and integerRange should work', () => {
  expect(Integer.is(1)).toBe(true);
  expect(Integer.is(0)).toBe(true);
  expect(Integer.is(-1)).toBe(true);
  expect(Integer.is(1.1)).toBe(false);

  expect(Integer.diagnose(-1.1)).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "Expected integer, getting -1.1.",
        "path": Array [],
      },
    ]
  `);

  const RangeA = integerRange({min: 0, max: 2});
  const RangeB = integerRange({min: -1});
  const RangeC = integerRange({max: 3});

  type Range = x.TypeOf<typeof RangeA>;

  type _ = AssertTrue<IsEqual<Range, Nominal<'integer', number>>>;

  expect(RangeA.is(1)).toBe(true);
  expect(RangeA.is(2)).toBe(true);
  expect(RangeA.is(-1)).toBe(false);
  expect(RangeA.diagnose(1.1)).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "Expected integer, getting 1.1.",
        "path": Array [],
      },
    ]
  `);
  expect(RangeA.diagnose(3)).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "Expected integer <= 2, getting 3.",
        "path": Array [],
      },
    ]
  `);

  expect(RangeB.is(1000)).toBe(true);
  expect(RangeB.is(-2)).toBe(false);

  expect(RangeC.is(1000)).toBe(false);
  expect(RangeC.is(-2)).toBe(true);
});

test('numberRange should work', () => {
  const RangeA = numberRange({minInclusive: 1.1, maxExclusive: 2});
  const RangeB = numberRange({minExclusive: 0, maxInclusive: 3});

  type Range = x.TypeOf<typeof RangeA>;

  type _ = AssertTrue<IsEqual<Range, number>>;

  expect(RangeA.is(1.1)).toBe(true);
  expect(RangeA.diagnose(1)).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "Expected number >= 1.1, getting 1.",
        "path": Array [],
      },
    ]
  `);
  expect(RangeA.diagnose(2)).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "Expected number < 2, getting 2.",
        "path": Array [],
      },
    ]
  `);

  expect(RangeB.is(2.2)).toBe(true);
  expect(RangeB.is(3)).toBe(true);
  expect(RangeB.diagnose(-1)).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "Expected number > 0, getting -1.",
        "path": Array [],
      },
    ]
  `);
  expect(RangeB.diagnose(0)).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "Expected number > 0, getting 0.",
        "path": Array [],
      },
    ]
  `);
  expect(RangeB.diagnose(4)).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "Expected number <= 3, getting 4.",
        "path": Array [],
      },
    ]
  `);
});

test('literal type should work', () => {
  const Foo = x.literal('foo');
  const One = x.literal(1);
  const True = x.literal(true);

  expect(Foo.is('foo')).toBe(true);
  expect(One.is(1)).toBe(true);
  expect(True.is(true)).toBe(true);

  expect(Foo.diagnose('bar')).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "Expected string \\"foo\\", getting \\"bar\\".",
        "path": Array [],
      },
    ]
  `);
  expect(One.diagnose(2)).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "Expected number 1, getting 2.",
        "path": Array [],
      },
    ]
  `);
  expect(True.diagnose(false)).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "Expected boolean true, getting false.",
        "path": Array [],
      },
    ]
  `);

  type _ =
    | AssertTrue<IsEqual<TypeOf<typeof Foo>, 'foo'>>
    | AssertTrue<IsEqual<TypeOf<typeof One>, 1>>
    | AssertTrue<IsEqual<TypeOf<typeof True>, true>>;
});

test('literal type should throw on unsupported values', () => {
  expect(() => x.literal({} as any)).toThrow(TypeError);
});

test('equal should work', () => {
  const o = {foo: 'bar'};

  const O = x.equal(o);

  expect(O.is(o)).toBe(true);
  expect(O.is({foo: 'bar'})).toBe(true);
  expect(O.is({})).toBe(false);
  expect(O.is(123)).toBe(false);

  expect(O.encode(x.json, o)).toBe(JSON.stringify(o));
  expect(O.decode(x.json, JSON.stringify(o))).toEqual(o);

  expect(() => O.encode(x.json, {} as any)).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Unexpected value."
  `);
  expect(() => O.decode(x.json, JSON.stringify({})))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Unexpected value."
  `);
});
