import * as x from '../../library';
import {TypeConstraintError, TypeOf} from '../../library';

export const Sunday = x.Date.refine<Date & {__nominal: 'Sunday'}>(
  date => date.getDay() === 0,
);

it('pre-defined atomic types should decode/encode json medium', () => {
  expect(x.nullType.decode(x.json, 'null')).toBe(null);
  expect(x.string.decode(x.json, '"text"')).toBe('text');
  expect(x.number.decode(x.json, '123')).toBe(123);
  expect(x.boolean.decode(x.json, 'true')).toBe(true);

  expect(x.nullType.encode(x.json, null)).toBe('null');
  expect(x.string.encode(x.json, 'text')).toBe('"text"');
  expect(x.number.encode(x.json, 123)).toBe('123');
  expect(x.boolean.encode(x.json, true)).toBe('true');
});

it('pre-defined atomic types should error decode/encode json medium with wrong unpacked value', () => {
  expect(() => x.nullType.decode(x.json, '"text"')).toThrow(
    TypeConstraintError,
  );
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

it('date atomic type should error decoding json medium', () => {
  expect(() =>
    x.Date.decode(x.json, JSON.stringify(new Date().toISOString())),
  ).toThrow(TypeConstraintError);

  // Will not throw because json medium has defined atomicTypeSymbol codec as
  // fallback:
  // expect(() => x.Date.encode(x.json, new Date())).toThrow(TypeConstraintError);
});

it('date atomic type should decode/encode extended json medium', () => {
  let date = new Date();

  expect(x.Date.decode(x.extendedJSON, JSON.stringify(date)).getTime()).toBe(
    date.getTime(),
  );

  expect(x.Date.encode(x.extendedJSON, date)).toBe(JSON.stringify(date));
});

it('date atomic refinement sunday should work with extended json medium', () => {
  let sunday = new Date('2022-3-27');
  let monday = new Date('2022-3-28');

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
        "message": "Unexpected value",
      },
    ]
  `);

  expect(Sunday.satisfies(sunday)).toBe(sunday);
  expect(() => Sunday.satisfies(monday)).toThrow(TypeConstraintError);
});

it('date atomic refinement sunday should work with extended json value medium', () => {
  let sunday = new Date('2022-3-27') as TypeOf<typeof Sunday>;
  let monday = new Date('2022-3-28');

  expect(
    Sunday.decode(x.extendedJSONValue, sunday.toISOString()).getTime(),
  ).toBe(sunday.getTime());
  expect(() =>
    Sunday.decode(x.extendedJSONValue, monday.toISOString()),
  ).toThrow(TypeConstraintError);

  expect(Sunday.encode(x.extendedJSONValue, sunday)).toEqual(
    sunday.toISOString(),
  );
  expect(() => Sunday.encode(x.extendedJSONValue, monday as any)).toThrow(
    TypeConstraintError,
  );
});
