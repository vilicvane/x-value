import type {AssertTrue, IsEqual} from 'tslang';

import * as x from '../library';
import type {
  Denominalize,
  MediumTypeOf,
  Nominal,
  TransformNominal,
  TypeOf,
} from '../library';

import type {MediumATypes, MediumBTypes} from './@usage';
import {Identifier, mediumA} from './@usage';

let unknownValue: unknown;

test('atomic refinement should work', () => {
  const NonEmptyString = x.string.refine(value =>
    value.length > 0 ? true : 'Empty',
  );

  type NonEmptyString = TypeOf<typeof NonEmptyString>;

  expect(NonEmptyString.encode(x.jsonValue, 'abc')).toBe('abc');
  expect(NonEmptyString.decode(x.jsonValue, 'abc')).toBe('abc');
  expect(() => NonEmptyString.encode(x.jsonValue, ''))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Empty"
  `);
  expect(() => NonEmptyString.encode(x.jsonValue, [1, 2, 3] as any))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Expected string, getting [object Array]."
  `);

  const Email = x.string.refine<Nominal<'email'>>(value => value.includes('@'));

  type Email = TypeOf<typeof Email>;
  type EmailInJSONValue = MediumTypeOf<typeof Email, x.JSONValueTypes>;

  expect(Email.is('user@domain')).toBe(true);
  expect(Email.is('user#domain')).toBe(false);

  if (Email.is(unknownValue)) {
    type _ = AssertTrue<IsEqual<typeof unknownValue, Email>>;
  }

  const encodedEmailInJSONValue = Email.encode(
    x.jsonValue,
    'user@domain' as Email,
  );

  type EncodedEmailInJSONValue = typeof encodedEmailInJSONValue;

  const LiveEmail = Email.refine<Nominal<'live-email'>>([
    value => value.endsWith('@live'),
  ]);

  type LiveEmail = TypeOf<typeof LiveEmail>;
  type LiveEmailInJSONValue = MediumTypeOf<typeof LiveEmail, x.JSONValueTypes>;

  expect(LiveEmail.is('user@live')).toBe(true);
  expect(LiveEmail.is('user@domain')).toBe(false);
  expect(LiveEmail.is('user#domain')).toBe(false);

  if (LiveEmail.is(unknownValue)) {
    type _ = AssertTrue<IsEqual<typeof unknownValue, LiveEmail>>;
  }

  const UserId = Identifier.nominal<'user'>();

  type UserId = TypeOf<typeof UserId>;

  type UserIdInMediumA = MediumTypeOf<typeof UserId, MediumATypes>;
  type UserIdInMediumB = MediumTypeOf<typeof UserId, MediumBTypes>;

  const encodedUserIdInMediumA = UserId.encode(mediumA, 'ffff' as UserId);

  const userId = encodedUserIdInMediumA.toString('hex');

  expect(userId).toBe('ffff');

  type _ =
    | AssertTrue<IsEqual<NonEmptyString, string>>
    | AssertTrue<IsEqual<Email, Nominal<'email', string>>>
    | AssertTrue<IsEqual<Denominalize<Email>, string>>
    | AssertTrue<IsEqual<EmailInJSONValue, Nominal<'email', string>>>
    | AssertTrue<IsEqual<Denominalize<EmailInJSONValue>, string>>
    | AssertTrue<IsEqual<EmailInJSONValue, EncodedEmailInJSONValue>>
    | AssertTrue<IsEqual<LiveEmail, Nominal<'email' | 'live-email', string>>>
    | AssertTrue<IsEqual<Denominalize<LiveEmail>, string>>
    | AssertTrue<
        IsEqual<LiveEmailInJSONValue, Nominal<'email' | 'live-email', string>>
      >
    | AssertTrue<IsEqual<UserId, Nominal<'user', string>>>
    | AssertTrue<IsEqual<UserIdInMediumA, Nominal<'user', Buffer>>>
    | AssertTrue<IsEqual<UserIdInMediumB, Nominal<'user', number>>>
    | AssertTrue<IsEqual<typeof encodedUserIdInMediumA, UserIdInMediumA>>
    | AssertTrue<IsEqual<typeof userId, UserId>>
    | AssertTrue<IsEqual<TransformNominal<UserId, number>, UserIdInMediumB>>;
});

test('array refinement should work', () => {
  const Triple = x
    .array(x.string)
    .refine<{length: 3}>(value => value.length === 3);

  type Triple = TypeOf<typeof Triple>;
  type TripleInJSONValue = MediumTypeOf<typeof Triple, x.JSONValueTypes>;

  expect(Triple.is(['', '', ''])).toBe(true);
  expect(Triple.is([])).toBe(false);
  expect(Triple.is(false)).toBe(false);

  if (Triple.is(unknownValue)) {
    type _ = AssertTrue<IsEqual<typeof unknownValue, Triple>>;
  }

  type _ =
    | AssertTrue<IsEqual<Triple, string[] & {length: 3}>>
    | AssertTrue<IsEqual<TripleInJSONValue, string[] & {length: 3}>>;
});

test('object refinement should work', () => {
  const O = x
    .object({foo: x.string, bar: x.number})
    .refine<{foo: 'abc'}>(value => value.foo === 'abc');

  type O = TypeOf<typeof O>;

  expect(O.is({foo: 'abc', bar: 123})).toBe(true);
  expect(O.is({foo: 'def', bar: 123})).toBe(false);
  expect(O.is({foo: 'abc'})).toBe(false);
  expect(O.is([])).toBe(false);
  expect(O.is(false)).toBe(false);

  if (O.is(unknownValue)) {
    type _ = AssertTrue<IsEqual<typeof unknownValue, O>>;
  }

  type _ = AssertTrue<IsEqual<O, {foo: 'abc'; bar: number}>>;
});

test('optional refinement should work', () => {
  const O = x
    .optional(x.string)
    .refine<Nominal<'includes #'>>(
      value => value === undefined || value.includes('#'),
    );

  type O = TypeOf<typeof O>;

  expect(O.is('#')).toBe(true);
  expect(O.is(undefined)).toBe(true);
  expect(O.is('')).toBe(false);
  expect(O.is([])).toBe(false);
  expect(O.is(false)).toBe(false);

  if (O.is(unknownValue)) {
    type _ = AssertTrue<IsEqual<typeof unknownValue, O>>;
  }

  type _ = AssertTrue<IsEqual<O, Nominal<'includes #', string | undefined>>>;
});

test('record refinement should work', () => {
  const O = x
    .record(x.string, x.number)
    .refine<Nominal<'not empty'>>(value => Object.keys(value).length > 0);

  type O = TypeOf<typeof O>;

  expect(O.is({foo: 123})).toBe(true);
  expect(O.is({foo: 'bar'})).toBe(false);
  expect(O.is({})).toBe(false);
  expect(O.is(false)).toBe(false);

  if (O.is(unknownValue)) {
    type _ = AssertTrue<IsEqual<typeof unknownValue, O>>;
  }

  type _ = AssertTrue<IsEqual<O, Nominal<'not empty', Record<string, number>>>>;
});

test('tuple refinement should work', () => {
  const O = x
    .tuple(x.string, x.number)
    .refine<Nominal<'string is abc and number is 123'>>(
      ([a, b]) => a === 'abc' && b === 123,
    );

  type O = TypeOf<typeof O>;

  expect(O.is(['abc', 123])).toBe(true);
  expect(O.is(['abc'])).toBe(false);
  expect(O.is(['def', 123])).toBe(false);
  expect(O.is(['abc', 456])).toBe(false);
  expect(O.is({})).toBe(false);
  expect(O.is(false)).toBe(false);

  if (O.is(unknownValue)) {
    type _ = AssertTrue<IsEqual<typeof unknownValue, O>>;
  }

  type _ = AssertTrue<
    IsEqual<O, Nominal<'string is abc and number is 123', [string, number]>>
  >;
});

test('intersection refinement should work', () => {
  const O = x
    .intersection(x.object({foo: x.string}), x.object({bar: x.number}))
    .refine<Nominal<'foo is abc'>>(value => value.foo === 'abc');

  type O = TypeOf<typeof O>;

  expect(O.is({foo: 'abc', bar: 123})).toBe(true);
  expect(O.is({foo: 'def', bar: 456})).toBe(false);
  expect(O.is({})).toBe(false);
  expect(O.is(123)).toBe(false);

  if (O.is(unknownValue)) {
    type _ = AssertTrue<IsEqual<typeof unknownValue, O>>;
  }

  type _ = AssertTrue<
    IsEqual<O, Nominal<'foo is abc', {foo: string; bar: number}>>
  >;
});

test('union refinement should work', () => {
  const O = x
    .union(x.object({foo: x.string}), x.object({bar: x.number}))
    .refine<Nominal<'foo is abc or bar is 123'>>(
      value =>
        ('foo' in value && value.foo === 'abc') ||
        ('bar' in value && value.bar === 123),
    );

  type O = TypeOf<typeof O>;

  expect(O.is({foo: 'abc'})).toBe(true);
  expect(O.is({bar: 123})).toBe(true);
  expect(O.is({foo: 'def'})).toBe(false);
  expect(O.is({bar: 456})).toBe(false);
  expect(O.is({})).toBe(false);
  expect(O.is(123)).toBe(false);

  if (O.is(unknownValue)) {
    type _ = AssertTrue<IsEqual<typeof unknownValue, O>>;
  }

  type _ = AssertTrue<
    IsEqual<
      O,
      Nominal<'foo is abc or bar is 123', {foo: string} | {bar: number}>
    >
  >;
});
