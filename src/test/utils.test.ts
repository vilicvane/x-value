import type {AssertFalse, AssertTrue, IsCompatible, IsEqual} from 'tslang';

import * as x from '../library/index.js';

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
        "message": "Expected integer, got -1.1.",
        "path": [],
      },
    ]
  `);

  const RangeA = x.integerRange({min: 0, max: 2});
  const RangeB = x.integerRange({min: -1});
  const RangeC = x.integerRange({max: 3});

  type Range = x.TypeOf<typeof RangeA>;

  type _assert = AssertTrue<IsEqual<Range, x.Nominal<'integer', number>>>;

  expect(RangeA.is(1)).toBe(true);
  expect(RangeA.is(2)).toBe(true);
  expect(RangeA.is(-1)).toBe(false);
  expect(RangeA.diagnose(1.1)).toMatchInlineSnapshot(`
    [
      {
        "message": "Expected integer, got 1.1.",
        "path": [],
      },
    ]
  `);
  expect(RangeA.diagnose(3)).toMatchInlineSnapshot(`
    [
      {
        "message": "Expected integer <= 2, got 3.",
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

  type _assert = AssertTrue<IsEqual<Range, number>>;

  expect(RangeA.is(1.1)).toBe(true);
  expect(RangeA.diagnose(1)).toMatchInlineSnapshot(`
    [
      {
        "message": "Expected number >= 1.1, got 1.",
        "path": [],
      },
    ]
  `);
  expect(RangeA.diagnose(2)).toMatchInlineSnapshot(`
    [
      {
        "message": "Expected number < 2, got 2.",
        "path": [],
      },
    ]
  `);

  expect(RangeB.is(2.2)).toBe(true);
  expect(RangeB.is(3)).toBe(true);
  expect(RangeB.diagnose(-1)).toMatchInlineSnapshot(`
    [
      {
        "message": "Expected number > 0, got -1.",
        "path": [],
      },
    ]
  `);
  expect(RangeB.diagnose(0)).toMatchInlineSnapshot(`
    [
      {
        "message": "Expected number > 0, got 0.",
        "path": [],
      },
    ]
  `);
  expect(RangeB.diagnose(4)).toMatchInlineSnapshot(`
    [
      {
        "message": "Expected number <= 3, got 4.",
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
        "message": "Expected string "foo", got "bar".",
        "path": [],
      },
    ]
  `);
  expect(One.diagnose(2)).toMatchInlineSnapshot(`
    [
      {
        "message": "Expected number 1, got 2.",
        "path": [],
      },
    ]
  `);
  expect(True.diagnose(false)).toMatchInlineSnapshot(`
    [
      {
        "message": "Expected boolean true, got false.",
        "path": [],
      },
    ]
  `);

  type _assert =
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
      Expected equal values."
  `);
  expect(() => O.decode(x.json, JSON.stringify({})))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expected equal values."
  `);
});

test('string pattern should work', () => {
  const Pattern = x.pattern(/\d/, 'Expected digit');

  expect(Pattern.is('1')).toBe(true);
  expect(Pattern.is('a')).toBe(false);

  expect(Pattern.diagnose('a')).toMatchInlineSnapshot(`
    [
      {
        "message": "Expected digit",
        "path": [],
      },
    ]
  `);
});

test('XTypeOfValue/XTypeOfMediumValue should work', () => {
  type _assert =
    | AssertTrue<
        IsCompatible<
          typeof x.Date,
          x.XTypeOfMediumValue<'extended-json-value', string>
        >
      >
    | AssertFalse<
        IsCompatible<
          typeof x.Date,
          x.XTypeOfMediumValue<'extended-json-value', number>
        >
      >
    | AssertTrue<IsCompatible<typeof x.Date, x.XTypeOfValue<Date>>>
    | AssertFalse<IsCompatible<typeof x.Date, x.XTypeOfValue<123>>>;
});

test('x.Promise should work', async () => {
  const StringPromise = x.Promise(x.string);

  type StringPromise = x.TypeOf<typeof StringPromise>;

  const valid_1 = StringPromise.sanitize(Promise.resolve('abc'));

  expect(await valid_1).toBe('abc');

  const invalid_1 = StringPromise.sanitize(Promise.resolve(123));

  await expect(invalid_1).rejects.toMatchInlineSnapshot(`
    [TypeError: Value does not satisfy the type:
      Expected string, got [object Number].]{
      "issues": [
        {
          "message": "Expected string, got [object Number].",
          "path": [],
        },
      ],
    }
  `);

  type _assert = AssertTrue<IsEqual<StringPromise, Promise<string>>>;
});

test('x.function should work', async () => {
  const F = x.function([x.string, x.number], x.void);

  type F = x.TypeOf<typeof F>;

  const valid_1 = F.sanitize(() => {});

  expect(valid_1('', 0)).toBe(undefined);

  // @ts-expect-error
  expect(() => valid_1()).toThrowErrorMatchingInlineSnapshot(`
    "Value does not satisfy the type:
      Expected value with 2 instead of 0 element(s)."
  `);

  const invalid_1 = F.sanitize(() => 123);

  expect(() => invalid_1('', 0)).toThrowErrorMatchingInlineSnapshot(`
    "Value does not satisfy the type:
      Expected undefined, got [object Number]."
  `);

  type _assert = AssertTrue<
    IsEqual<F, Function & ((arg_1: string, arg_2: number) => void)>
  >;
});
