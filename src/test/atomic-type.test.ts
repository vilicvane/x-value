import type {AssertTrue, IsEqual} from 'tslang';

import * as x from '../library';
import type {MediumTypeOf, TypeOf} from '../library';
import {TypeConstraintError, atomic, stringTypeSymbol} from '../library';

const Sunday = x.Date.refine<'sunday'>(date =>
  x.refinement(date.getDay() === 0, date),
);

type Sunday = TypeOf<typeof Sunday>;

test('pre-defined atomic types should decode/encode ecmascript medium', () => {
  expect(x.unknown.decode(x.ecmascript, true)).toBe(true);
  expect(x.unknown.decode(x.ecmascript, 123)).toBe(123);
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
});

test('pre-defined atomic types should error decode/encode ecmascript medium with wrong packed value', () => {
  expect(() => x.undefined.decode(x.ecmascript, true as any))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expected undefined, getting [object Boolean]."
  `);
  expect(() => x.voidType.decode(x.ecmascript, true as any))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expected undefined, getting [object Boolean]."
  `);
  expect(() => x.nullType.decode(x.ecmascript, undefined as any))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expected null, getting [object Undefined]."
  `);
  expect(() => x.string.decode(x.ecmascript, null as any))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expected string, getting [object Null]."
  `);
  expect(() => x.number.decode(x.ecmascript, 'text' as any))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expected number, getting [object String]."
  `);
  expect(() => x.boolean.decode(x.ecmascript, 123 as any))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expected boolean, getting [object Number]."
  `);

  expect(() => x.undefined.encode(x.ecmascript, true as any))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Expected undefined, getting [object Boolean]."
  `);
  expect(() => x.nullType.encode(x.ecmascript, undefined as any))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Expected null, getting [object Undefined]."
  `);
  expect(() => x.string.encode(x.ecmascript, null as any))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Expected string, getting [object Null]."
  `);
  expect(() => x.number.encode(x.ecmascript, 'text' as any))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Expected number, getting [object String]."
  `);
  expect(() => x.boolean.encode(x.ecmascript, 123 as any))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Expected boolean, getting [object Number]."
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
      Expected null, getting [object String]."
  `);
  expect(() => x.string.decode(x.json, '123')).toThrow(TypeConstraintError);
  expect(() => x.number.decode(x.json, 'true')).toThrow(TypeConstraintError);
  expect(() => x.boolean.decode(x.json, 'null')).toThrow(TypeConstraintError);

  expect(() => x.nullType.encode(x.json, 'text' as any)).toThrow(
    TypeConstraintError,
  );
  expect(() => x.string.encode(x.json, 123 as any)).toThrow(
    TypeConstraintError,
  );
  expect(() => x.number.encode(x.json, true as any)).toThrow(
    TypeConstraintError,
  );
  expect(() => x.boolean.encode(x.json, null as any)).toThrow(
    TypeConstraintError,
  );
});

test('date atomic type should error decoding json medium', () => {
  expect(() => x.Date.decode(x.json, JSON.stringify(new Date().toISOString())))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expected instance of Date, getting [object String]."
  `);

  // Will not throw because json medium has defined atomicTypeSymbol codec as
  // fallback:
  // expect(() => x.Date.encode(x.json, new Date())).toThrow(TypeConstraintError);
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
    TypeConstraintError,
  );

  expect(Sunday.encode(x.extendedJSON, sunday as TypeOf<typeof Sunday>)).toBe(
    JSON.stringify(sunday),
  );
  expect(() => Sunday.encode(x.extendedJSON, monday as any)).toThrow(
    TypeConstraintError,
  );

  expect(Sunday.is(sunday)).toBe(true);
  expect(Sunday.is(monday)).toBe(false);

  expect(Sunday.diagnose(monday)).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "Unexpected value.",
        "path": Array [],
      },
    ]
  `);

  const satisfiedSunday = Sunday.satisfies(sunday as unknown);

  type _ = AssertTrue<IsEqual<typeof satisfiedSunday, Sunday>>;

  expect(satisfiedSunday).toBe(sunday);
  expect(() => Sunday.satisfies(monday)).toThrow(TypeConstraintError);
});

test('date atomic refinement sunday should work with extended json value medium', () => {
  const sunday = new Date('2022-3-27') as TypeOf<typeof Sunday>;
  const monday = new Date('2022-3-28');

  expect(
    Sunday.decode(
      x.extendedJSONValue,
      sunday.toISOString() as MediumTypeOf<
        typeof Sunday,
        'extended-json-value'
      >,
    ).getTime(),
  ).toBe(sunday.getTime());
  expect(() =>
    Sunday.decode(x.extendedJSONValue, monday.toISOString() as any),
  ).toThrow(TypeConstraintError);

  expect(Sunday.encode(x.extendedJSONValue, sunday)).toEqual(
    sunday.toISOString(),
  );
  expect(() => Sunday.encode(x.extendedJSONValue, monday as any)).toThrow(
    TypeConstraintError,
  );
});

test('atomic with constraints array should work', () => {
  const Type = atomic(stringTypeSymbol, [
    value => x.constraint(typeof value === 'string'),
  ]);

  expect(Type.diagnose('')).toEqual([]);
  expect(Type.diagnose(123)).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "Unexpected value.",
        "path": Array [],
      },
    ]
  `);
});
