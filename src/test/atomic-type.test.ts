import type {AssertTrue, IsEqual} from 'tslang';

import * as x from '../library/index.js';

const Sunday = x.Date.refined<'sunday'>(date =>
  x.refinement(date.getDay() === 0, date),
);

type Sunday = x.TypeOf<typeof Sunday>;

test('pre-defined atomic types should decode/encode ecmascript medium', () => {
  expect(x.unknown.decode(x.ecmascript, true)).toBe(true);
  expect(x.unknown.decode(x.ecmascript, 123)).toBe(123);
  expect(
    x.unknown.decode(x.ecmascript, {
      foo: {
        bar: 'abc',
      },
    }),
  ).toEqual({
    foo: {
      bar: 'abc',
    },
  });
  expect(x.undefined.decode(x.ecmascript, undefined)).toBe(undefined);
  expect(x.voidType.decode(x.ecmascript, undefined)).toBe(undefined);
  expect(x.nullType.decode(x.ecmascript, null)).toBe(null);
  expect(x.string.decode(x.ecmascript, 'text')).toBe('text');
  expect(x.number.decode(x.ecmascript, 123)).toBe(123);
  expect(x.boolean.decode(x.ecmascript, true)).toBe(true);

  expect(x.undefined.encode(x.ecmascript, undefined)).toBe(undefined);
  expect(x.undefined.encode(x.ecmascript, undefined)).toBe(undefined);
  expect(x.nullType.encode(x.ecmascript, null)).toBe(null);
  expect(x.string.encode(x.ecmascript, 'text')).toBe('text');
  expect(x.number.encode(x.ecmascript, 123)).toBe(123);
  expect(x.boolean.encode(x.ecmascript, true)).toBe(true);

  const fn = (): void => {};

  expect(x.Function.decode(x.ecmascript, fn)).toBe(fn);
  expect(x.Function.encode(x.ecmascript, fn)).toBe(fn);
});

test('pre-defined atomic types should error decode/encode ecmascript medium with wrong packed value', () => {
  // @ts-expect-error
  expect(() => x.never.decode(x.ecmascript, true))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expected never, got [object Boolean]."
  `);
  // @ts-expect-error
  expect(() => x.undefined.decode(x.ecmascript, true))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expected undefined, got [object Boolean]."
  `);
  // @ts-expect-error
  expect(() => x.voidType.decode(x.ecmascript, true))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expected undefined, got [object Boolean]."
  `);
  // @ts-expect-error
  expect(() => x.nullType.decode(x.ecmascript, undefined))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expected null, got [object Undefined]."
  `);
  // @ts-expect-error
  expect(() => x.string.decode(x.ecmascript, null))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expected string, got [object Null]."
  `);
  // @ts-expect-error
  expect(() => x.number.decode(x.ecmascript, 'text'))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expected number, got [object String]."
  `);
  // @ts-expect-error
  expect(() => x.boolean.decode(x.ecmascript, 123))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expected boolean, got [object Number]."
  `);

  // @ts-expect-error
  expect(() => x.undefined.encode(x.ecmascript, true))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Expected undefined, got [object Boolean]."
  `);
  // @ts-expect-error
  expect(() => x.nullType.encode(x.ecmascript, undefined))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Expected null, got [object Undefined]."
  `);
  // @ts-expect-error
  expect(() => x.string.encode(x.ecmascript, null))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Expected string, got [object Null]."
  `);
  // @ts-expect-error
  expect(() => x.number.encode(x.ecmascript, 'text'))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Expected number, got [object String]."
  `);
  // @ts-expect-error
  expect(() => x.boolean.encode(x.ecmascript, 123))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Expected boolean, got [object Number]."
  `);
  // @ts-expect-error
  expect(() => x.Function.encode(x.ecmascript, null))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Expected function, got [object Null]."
  `);
});

test('pre-defined atomic types should decode/encode json medium', () => {
  expect(x.nullType.decode(x.json, 'null')).toBe(null);
  expect(x.string.decode(x.json, '"text"')).toBe('text');
  expect(x.number.decode(x.json, '123')).toBe(123);
  expect(x.boolean.decode(x.json, 'true')).toBe(true);

  expect(x.nullType.encode(x.json, null)).toBe('null');
  expect(x.string.encode(x.json, 'text')).toBe('"text"');
  expect(x.number.encode(x.json, 123)).toBe('123');
  expect(x.boolean.encode(x.json, true)).toBe('true');
});

test('pre-defined atomic types should error decode/encode json medium with wrong packed value', () => {
  expect(() => x.nullType.decode(x.json, '"text"'))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expected null, got [object String]."
  `);
  expect(() => x.string.decode(x.json, '123')).toThrow(x.TypeConstraintError);
  expect(() => x.number.decode(x.json, 'true')).toThrow(x.TypeConstraintError);
  expect(() => x.boolean.decode(x.json, 'null')).toThrow(x.TypeConstraintError);

  // @ts-expect-error
  expect(() => x.nullType.encode(x.json, 'text')).toThrow(
    x.TypeConstraintError,
  );
  // @ts-expect-error
  expect(() => x.string.encode(x.json, 123)).toThrow(x.TypeConstraintError);
  // @ts-expect-error
  expect(() => x.number.encode(x.json, true)).toThrow(x.TypeConstraintError);
  // @ts-expect-error
  expect(() => x.boolean.encode(x.json, null)).toThrow(x.TypeConstraintError);
});

test('date atomic type should error decoding json medium', () => {
  expect(() => x.Date.decode(x.json, JSON.stringify(new Date().toISOString())))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expected instance of Date, got [object String]."
  `);

  // Will not throw because json medium has defined atomicTypeSymbol codec as
  // fallback:
  // expect(() => x.Date.encode(x.json, new Date())).toThrow(x.TypeConstraintError);
});

test('date atomic type should work with extended json medium', () => {
  const date = new Date();

  expect(x.Date.decode(x.extendedJSON, JSON.stringify(date)).getTime()).toBe(
    date.getTime(),
  );

  expect(x.Date.encode(x.extendedJSON, date)).toBe(JSON.stringify(date));

  expect(() => x.Date.decode(x.extendedJSON, '"invalid date"'))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Invalid date value"
  `);
});

test('date atomic refinement sunday should work with extended json medium', () => {
  const sunday = new Date('2022-3-27');
  const monday = new Date('2022-3-28');

  expect(Sunday.decode(x.extendedJSON, JSON.stringify(sunday)).getTime()).toBe(
    sunday.getTime(),
  );
  expect(() => Sunday.decode(x.extendedJSON, JSON.stringify(monday))).toThrow(
    x.TypeConstraintError,
  );
  // @ts-expect-error
  expect(Sunday.encode(x.extendedJSON, sunday)).toBe(JSON.stringify(sunday));
  // @ts-expect-error
  expect(() => Sunday.encode(x.extendedJSON, monday)).toThrow(
    x.TypeConstraintError,
  );

  expect(Sunday.is(sunday)).toBe(true);
  expect(Sunday.is(monday)).toBe(false);

  expect(Sunday.diagnose(monday)).toMatchInlineSnapshot(`
    [
      {
        "message": "Unexpected value.",
        "path": [],
      },
    ]
  `);

  expect(() => Sunday.asserts(monday)).toThrow(x.TypeConstraintError);

  const satisfiedSunday = Sunday.satisfies(sunday);

  type _ = AssertTrue<IsEqual<typeof satisfiedSunday, Sunday>>;

  expect(satisfiedSunday).toBe(sunday);
  expect(() => Sunday.satisfies(monday)).toThrow(x.TypeConstraintError);
});

test('date atomic refinement sunday should work with extended json value medium', () => {
  const sunday = new Date('2022-3-27') as x.TypeOf<typeof Sunday>;
  const monday = new Date('2022-3-28');

  Sunday.asserts(sunday);

  expect(
    Sunday.decode(
      x.extendedJSONValue,
      sunday.toISOString() as x.MediumTypeOf<
        'extended-json-value',
        typeof Sunday
      >,
    ).getTime(),
  ).toBe(sunday.getTime());
  expect(() =>
    // @ts-expect-error
    Sunday.decode(x.extendedJSONValue, monday.toISOString()),
  ).toThrow(x.TypeConstraintError);

  expect(Sunday.encode(x.extendedJSONValue, sunday)).toEqual(
    sunday.toISOString(),
  );
  // @ts-expect-error
  expect(() => Sunday.encode(x.extendedJSONValue, monday)).toThrow(
    x.TypeConstraintError,
  );
});

test('atomic with constraints array should work', () => {
  const Type = x.atomic(x.stringTypeSymbol, [
    value => x.constraint(typeof value === 'string'),
  ]);

  expect(Type.diagnose('')).toEqual([]);
  expect(Type.diagnose(123)).toMatchInlineSnapshot(`
    [
      {
        "message": "Unexpected value.",
        "path": [],
      },
    ]
  `);
});
