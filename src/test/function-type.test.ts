import type {AssertTrue, IsEqual} from 'tslang';

import * as x from '../library';

import {Identifier, mediumA} from './@usage';

test('encode/decode/transform/diagnose', () => {
  const F = x.fn([x.string, x.boolean], x.number);

  type F = x.TypeOf<typeof F>;
  type FInECMAScriptMedium = x.MediumTypeOf<'ecmascript', typeof F>;

  const f: F = (a, b) => {
    return b ? a.length + 1 : a.length - 1;
  };

  expect(F.encode(x.ecmascript, f)).toBe(f);
  expect(F.decode(x.ecmascript, f)).toBe(f);
  expect(F.transform(x.ecmascript, x.ecmascript, f)).toBe(f);
  expect(F.diagnose(f)).toEqual([]);

  // @ts-expect-error
  expect(() => F.encode(x.ecmascript, undefined))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Expected a function, got [object Undefined]."
  `);
  // @ts-expect-error
  expect(() => F.decode(x.ecmascript, undefined))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expected a function, got [object Undefined]."
  `);
  // @ts-expect-error
  expect(() => F.transform(x.ecmascript, x.ecmascript, undefined))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      Expected a function, got [object Undefined]."
  `);
  expect(F.diagnose(undefined)).toMatchInlineSnapshot(`
    [
      {
        "message": "Expected a function, got [object Undefined].",
        "path": [],
      },
    ]
  `);

  type _ =
    | AssertTrue<IsEqual<F, (...args: [string, boolean]) => number>>
    | AssertTrue<
        IsEqual<FInECMAScriptMedium, (...args: [string, boolean]) => number>
      >;
});

test('guard', () => {
  const F = x.fn([Identifier], Identifier);

  type F = x.TypeOf<typeof F>;
  type FInMediumA = x.MediumTypeOf<'medium-a', typeof F>;

  const f = F.guard(id => (parseInt(id, 16) + 1).toString(16).padStart(4, '0'));

  const fForMediumA = F.guard(mediumA, id =>
    (parseInt(id, 16) + 1).toString(16).padStart(4, '0'),
  );

  expect(f('0001')).toBe('0002');
  expect(fForMediumA(Buffer.from([0x00, 0x01]))).toEqual(
    Buffer.from([0x00, 0x02]),
  );

  expect(() => (f as Function)()).toThrowErrorMatchingInlineSnapshot(`
    "Failed to call guarded function:
      Expected at least 1 argument(s), got 0."
  `);
  // @ts-expect-error
  expect(() => f(1234)).toThrowErrorMatchingInlineSnapshot(`
    "Failed to call guarded function:
      [args[0]] Unexpected value."
  `);
  // @ts-expect-error
  expect(() => F.guard(() => 1234)('0000')).toThrowErrorMatchingInlineSnapshot(`
    "Failed to validate guarded function return value:
      Unexpected value."
  `);
  expect(() => (fForMediumA as Function)()).toThrowErrorMatchingInlineSnapshot(`
    "Failed to call guarded function:
      Expected at least 1 argument(s), got 0."
  `);
  // @ts-expect-error
  expect(() => fForMediumA(1234)).toThrowErrorMatchingInlineSnapshot(`
    "Failed to call guarded function:
      [args[0]] Value must be a buffer"
  `);
  // @ts-expect-error
  expect(() => F.guard(mediumA, () => 1234)(Buffer.from([0x00, 0x01])))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to validate guarded function return value:
      Unexpected value."
  `);

  expect(() =>
    x
      .fn([x.object({foo: x.string})], x.voidType)
      .exact()
      .guard(() => {})({
      foo: 'abc',
      // @ts-expect-error
      bar: 123,
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    "Failed to call guarded function:
      [args[0]] Unknown key(s) "bar"."
  `);

  type _ =
    | AssertTrue<IsEqual<F, (...args: [string]) => string>>
    | AssertTrue<IsEqual<FInMediumA, (...args: [Buffer]) => Buffer>>
    | AssertTrue<IsEqual<typeof f, (...args: [string]) => string>>
    | AssertTrue<IsEqual<typeof fForMediumA, (...args: [Buffer]) => Buffer>>;
});
