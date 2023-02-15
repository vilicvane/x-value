import type {AssertTrue, IsEqual} from 'tslang';

import * as x from '../library';

test('UnknownRecord type should work', () => {
  expect(x.UnknownRecord.is({})).toBe(true);
  expect(x.UnknownRecord.is({key: 'value'})).toBe(true);
  expect(x.UnknownRecord.is([])).toBe(true);
  expect(x.UnknownRecord.is(() => {})).toBe(false);

  const value = {hello: ['world', '!']};

  expect(x.UnknownRecord.decode(x.json, JSON.stringify(value))).toEqual({
    hello: ['world', '!'],
  });
});

test('Integer and integerRange should work', () => {
  expect(x.Integer.is(1)).toBe(true);
  expect(x.Integer.is(0)).toBe(true);
  expect(x.Integer.is(-1)).toBe(true);
  expect(x.Integer.is(1.1)).toBe(false);

  expect(x.Integer.diagnose(-1.1)).toMatchInlineSnapshot(`
    [
      {
        "message": "Expected integer, getting -1.1.",
        "path": [],
      },
    ]
  `);

  const RangeA = x.integerRange({min: 0, max: 2});
  const RangeB = x.integerRange({min: -1});
  const RangeC = x.integerRange({max: 3});

  type Range = x.TypeOf<typeof RangeA>;

  type _ = AssertTrue<IsEqual<Range, x.Nominal<'integer', number>>>;

  expect(RangeA.is(1)).toBe(true);
  expect(RangeA.is(2)).toBe(true);
  expect(RangeA.is(-1)).toBe(false);
  expect(RangeA.diagnose(1.1)).toMatchInlineSnapshot(`
    [
      {
        "message": "Expected integer, getting 1.1.",
        "path": [],
      },
    ]
  `);
  expect(RangeA.diagnose(3)).toMatchInlineSnapshot(`
    [
      {
        "message": "Expected integer <= 2, getting 3.",
        "path": [],
      },
    ]
  `);

  expect(RangeB.is(1000)).toBe(true);
  expect(RangeB.is(-2)).toBe(false);

  expect(RangeC.is(1000)).toBe(false);
  expect(RangeC.is(-2)).toBe(true);
});

test('numberRange should work', () => {
  const RangeA = x.numberRange({minInclusive: 1.1, maxExclusive: 2});
  const RangeB = x.numberRange({minExclusive: 0, maxInclusive: 3});

  type Range = x.TypeOf<typeof RangeA>;

  type _ = AssertTrue<IsEqual<Range, number>>;

  expect(RangeA.is(1.1)).toBe(true);
  expect(RangeA.diagnose(1)).toMatchInlineSnapshot(`
    [
      {
        "message": "Expected number >= 1.1, getting 1.",
        "path": [],
      },
    ]
  `);
  expect(RangeA.diagnose(2)).toMatchInlineSnapshot(`
    [
      {
        "message": "Expected number < 2, getting 2.",
        "path": [],
      },
    ]
  `);

  expect(RangeB.is(2.2)).toBe(true);
  expect(RangeB.is(3)).toBe(true);
  expect(RangeB.diagnose(-1)).toMatchInlineSnapshot(`
    [
      {
        "message": "Expected number > 0, getting -1.",
        "path": [],
      },
    ]
  `);
  expect(RangeB.diagnose(0)).toMatchInlineSnapshot(`
    [
      {
        "message": "Expected number > 0, getting 0.",
        "path": [],
      },
    ]
  `);
  expect(RangeB.diagnose(4)).toMatchInlineSnapshot(`
    [
      {
        "message": "Expected number <= 3, getting 4.",
        "path": [],
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
    [
      {
        "message": "Expected string "foo", getting "bar".",
        "path": [],
      },
    ]
  `);
  expect(One.diagnose(2)).toMatchInlineSnapshot(`
    [
      {
        "message": "Expected number 1, getting 2.",
        "path": [],
      },
    ]
  `);
  expect(True.diagnose(false)).toMatchInlineSnapshot(`
    [
      {
        "message": "Expected boolean true, getting false.",
        "path": [],
      },
    ]
  `);

  type _ =
    | AssertTrue<IsEqual<x.TypeOf<typeof Foo>, 'foo'>>
    | AssertTrue<IsEqual<x.TypeOf<typeof One>, 1>>
    | AssertTrue<IsEqual<x.TypeOf<typeof True>, true>>;
});

test('literal type should throw on unsupported values', () => {
  // @ts-expect-error
  expect(() => x.literal({})).toThrow(TypeError);
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

  // @ts-expect-error
  expect(() => O.encode(x.json, {})).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Unexpected value."
  `);
  expect(() => O.decode(x.json, JSON.stringify({})))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Unexpected value."
  `);
});
