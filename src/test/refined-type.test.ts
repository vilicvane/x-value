import type {AssertTrue, IsEqual} from 'tslang';

import * as x from '../library';

import {Identifier, mediumA} from './@usage';

let unknownValue: unknown;

test('atomic refinement should work', () => {
  const NonEmptyString = x.string.refined(value =>
    x.refinement(value !== '', value, 'Empty'),
  );

  type NonEmptyString = x.TypeOf<typeof NonEmptyString>;

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
  expect(() => NonEmptyString.decode(x.jsonValue, 0 as any))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expected string, getting [object Number]."
  `);

  const Email = x.string.refined<'email'>(value =>
    x.refinement(value.includes('@'), value),
  );

  type Email = x.TypeOf<typeof Email>;
  type EmailInJSONValue = x.MediumTypeOf<typeof Email, 'json-value'>;

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

  const LiveEmail = Email.refined<'live-email'>([
    value => x.refinement(value.endsWith('@live'), value),
  ]);

  type LiveEmail = x.TypeOf<typeof LiveEmail>;
  type LiveEmailInJSONValue = x.MediumTypeOf<typeof LiveEmail, 'json-value'>;

  expect(LiveEmail.is('user@live')).toBe(true);
  expect(LiveEmail.is('user@domain')).toBe(false);
  expect(LiveEmail.is('user#domain')).toBe(false);

  if (LiveEmail.is(unknownValue)) {
    type _ = AssertTrue<IsEqual<typeof unknownValue, LiveEmail>>;
  }

  const UserId = Identifier.nominal<'user'>();

  type UserId = x.TypeOf<typeof UserId>;

  type UserIdInMediumA = x.MediumTypeOf<typeof UserId, 'medium-a'>;
  type UserIdInMediumB = x.MediumTypeOf<typeof UserId, 'medium-b'>;

  const encodedUserIdInMediumA = UserId.encode(mediumA, 'ffff' as UserId);

  const userId = encodedUserIdInMediumA.toString('hex');

  expect(userId).toBe('ffff');

  type _ =
    | AssertTrue<IsEqual<NonEmptyString, string>>
    | AssertTrue<IsEqual<Email, x.Nominal<'email', string>>>
    | AssertTrue<IsEqual<x.Denominalize<Email>, string>>
    | AssertTrue<IsEqual<EmailInJSONValue, x.Nominal<'email', string>>>
    | AssertTrue<IsEqual<x.Denominalize<EmailInJSONValue>, string>>
    | AssertTrue<IsEqual<EmailInJSONValue, EncodedEmailInJSONValue>>
    | AssertTrue<IsEqual<LiveEmail, x.Nominal<'email' | 'live-email', string>>>
    | AssertTrue<IsEqual<x.Denominalize<LiveEmail>, string>>
    | AssertTrue<
        IsEqual<LiveEmailInJSONValue, x.Nominal<'email' | 'live-email', string>>
      >
    | AssertTrue<IsEqual<UserId, x.Nominal<'user', string>>>
    | AssertTrue<IsEqual<UserIdInMediumA, x.Nominal<'user', Buffer>>>
    | AssertTrue<IsEqual<UserIdInMediumB, x.Nominal<'user', number>>>
    | AssertTrue<IsEqual<typeof encodedUserIdInMediumA, UserIdInMediumA>>
    | AssertTrue<IsEqual<typeof userId, UserId>>
    | AssertTrue<IsEqual<x.TransformNominal<UserId, number>, UserIdInMediumB>>;
});

test('array refinement should work', () => {
  const Triple = x
    .array(x.string)
    .refined<never, {length: 3}>(value =>
      x.refinement(value.length === 3, value),
    );

  type Triple = x.TypeOf<typeof Triple>;
  type TripleInJSONValue = x.MediumTypeOf<typeof Triple, 'json-value'>;

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
    .refined<never, {foo: 'abc'}>(value =>
      x.refinement(value.foo === 'abc', value),
    );

  type O = x.TypeOf<typeof O>;

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

test('nullable refinement should work', () => {
  const O = x
    .union(x.string, x.undefined)
    .refined<'includes #'>(value =>
      x.refinement(value === undefined || value.includes('#'), value),
    );

  type O = x.TypeOf<typeof O>;

  expect(O.is('#')).toBe(true);
  expect(O.is(undefined)).toBe(true);
  expect(O.is('')).toBe(false);
  expect(O.is([])).toBe(false);
  expect(O.is(false)).toBe(false);

  if (O.is(unknownValue)) {
    type _ = AssertTrue<IsEqual<typeof unknownValue, O>>;
  }

  type _ = AssertTrue<IsEqual<O, x.Nominal<'includes #', string | undefined>>>;
});

test('record refinement should work', () => {
  const O = x
    .record(x.string, x.number)
    .refined<'not empty'>(value =>
      x.refinement(Object.keys(value).length > 0, value),
    );

  type O = x.TypeOf<typeof O>;

  expect(O.is({foo: 123})).toBe(true);
  expect(O.is({foo: 'bar'})).toBe(false);
  expect(O.is({})).toBe(false);
  expect(O.is(false)).toBe(false);

  if (O.is(unknownValue)) {
    type _ = AssertTrue<IsEqual<typeof unknownValue, O>>;
  }

  type _ = AssertTrue<
    IsEqual<O, x.Nominal<'not empty', Record<string, number>>>
  >;
});

test('tuple refinement should work', () => {
  const O = x
    .tuple(x.string, x.number)
    .refined<'string is abc and number is 123'>(([a, b]) =>
      x.refinement(a === 'abc' && b === 123, [a, b]),
    );

  type O = x.TypeOf<typeof O>;

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
    IsEqual<O, x.Nominal<'string is abc and number is 123', [string, number]>>
  >;
});

test('intersection refinement should work', () => {
  const O = x
    .intersection(x.object({foo: x.string}), x.object({bar: x.number}))
    .refined<'foo is abc'>(value => x.refinement(value.foo === 'abc', value));

  type O = x.TypeOf<typeof O>;

  expect(O.is({foo: 'abc', bar: 123})).toBe(true);
  expect(O.is({foo: 'def', bar: 456})).toBe(false);
  expect(O.is({})).toBe(false);
  expect(O.is(123)).toBe(false);

  if (O.is(unknownValue)) {
    type _ = AssertTrue<IsEqual<typeof unknownValue, O>>;
  }

  type _ = AssertTrue<
    IsEqual<O, x.Nominal<'foo is abc', {foo: string; bar: number}>>
  >;
});

test('union refinement should work', () => {
  const O = x
    .union(x.object({foo: x.string}), x.object({bar: x.number}))
    .refined<'foo is abc or bar is 123'>(value =>
      x.refinement(
        ('foo' in value && value.foo === 'abc') ||
          ('bar' in value && value.bar === 123),
        value,
      ),
    );

  type O = x.TypeOf<typeof O>;

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
      x.Nominal<'foo is abc or bar is 123', {foo: string} | {bar: number}>
    >
  >;
});

test('exact with refined type should work', () => {
  const O = x
    .object({
      foo: x.string,
    })
    .refined(value => x.refinement(value.foo.startsWith('#'), value))
    .exact();

  const valid1 = {
    foo: '#abc',
  };

  const invalid1 = {
    foo: 'abc',
    bar: 123,
  };

  const invalid2 = {
    foo: '#def',
    bar: 123,
  };

  expect(O.is(valid1)).toBe(true);
  expect(O.encode(x.jsonValue, valid1)).toEqual(valid1);
  expect(O.decode(x.jsonValue, valid1)).toEqual(valid1);
  expect(O.transform(x.jsonValue, x.json, valid1)).toBe(JSON.stringify(valid1));

  expect(O.diagnose(invalid1)).toMatchInlineSnapshot(`
    [
      {
        "deferrable": true,
        "message": "Unknown key(s) "bar".",
        "path": [],
      },
      {
        "message": "Unexpected value.",
        "path": [],
      },
    ]
  `);
  expect(O.diagnose(invalid2)).toMatchInlineSnapshot(`
    [
      {
        "deferrable": true,
        "message": "Unknown key(s) "bar".",
        "path": [],
      },
    ]
  `);
  expect(() => O.encode(x.json, invalid1)).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Unknown key(s) "bar".
      Unexpected value."
  `);
  expect(() => O.encode(x.json, invalid2)).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Unknown key(s) "bar"."
  `);
  expect(() => O.decode(x.jsonValue, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Unknown key(s) "bar".
      Unexpected value."
  `);
  expect(() => O.decode(x.jsonValue, invalid2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Unknown key(s) "bar"."
  `);
  expect(() => O.transform(x.jsonValue, x.json, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      Unknown key(s) "bar".
      Unexpected value."
  `);
  expect(() => O.transform(x.jsonValue, x.json, invalid2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      Unknown key(s) "bar"."
  `);
});

test('transform exact refined type', () => {
  const T1 = x
    .union(x.object({foo: x.string}), x.object({bar: x.number}))
    .refined(value => value)
    .exact();

  const T2 = x
    .array(x.object({foo: x.string}))
    .refined(value => value)
    .exact();

  const T3 = x
    .intersection(x.object({foo: x.string}), x.object({bar: x.number}))
    .refined(value => value)
    .exact();

  const T4 = x
    .record(x.string, x.object({bar: x.number}))
    .refined(value => value)
    .exact();

  const T5 = x
    .tuple(x.string, x.object({bar: x.number}))
    .refined(value => value)
    .exact();

  interface T6 {
    next?: T6;
  }

  const T6 = x
    .recursive<T6>(T6 => x.object({next: T6.optional()}))
    .refined(value => value)
    .exact();

  const valid1 = {
    foo: 'abc',
  };

  const valid2 = [valid1];

  const valid3 = {
    foo: 'abc',
    bar: 123,
  };

  const valid4 = {
    foo: {
      bar: 123,
    },
  };

  const valid5: x.TypeOf<typeof T5> = ['abc', {bar: 123}];

  const valid6 = {
    next: {
      next: {},
    },
  };

  const invalid1 = {
    ...valid1,
    bar: 123,
  };

  const invalid2 = [invalid1];

  const invalid3 = {
    ...valid3,
    extra: true,
  };

  const invalid4 = {
    foo: {
      bar: 123,
      extra: true,
    },
  };

  const invalid5: any = ['abc', {bar: 123, extra: true}];

  const invalid6: any = {
    next: {
      next: {
        extra: true,
      },
    },
  };

  expect(T1.transform(x.jsonValue, x.json, valid1)).toBe(
    JSON.stringify(valid1),
  );
  expect(T2.transform(x.jsonValue, x.json, valid2)).toBe(
    JSON.stringify(valid2),
  );
  expect(T3.transform(x.jsonValue, x.json, valid3)).toBe(
    JSON.stringify(valid3),
  );
  expect(T4.transform(x.jsonValue, x.json, valid4)).toBe(
    JSON.stringify(valid4),
  );
  expect(T5.transform(x.jsonValue, x.json, valid5)).toBe(
    JSON.stringify(valid5),
  );
  expect(T6.transform(x.jsonValue, x.json, valid6)).toBe(
    JSON.stringify(valid6),
  );

  expect(() => T1.transform(x.jsonValue, x.json, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      Unknown key(s) "bar"."
  `);
  expect(() => T2.transform(x.jsonValue, x.json, invalid2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      [0] Unknown key(s) "bar"."
  `);
  expect(() => T3.transform(x.jsonValue, x.json, invalid3))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      Unknown key(s) "extra"."
  `);
  expect(() => T4.transform(x.jsonValue, x.json, invalid4))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      ["foo"] Unknown key(s) "extra"."
  `);
  expect(() => T5.transform(x.jsonValue, x.json, invalid5))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      [1] Unknown key(s) "extra"."
  `);
  expect(() => T6.transform(x.jsonValue, x.json, invalid6))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      ["next"]["next"] Unknown key(s) "extra"."
  `);
});

test('nominalize', () => {
  const Email = x.string.nominal<'email'>();
  const LiveEmail = Email.nominal<'live-email'>();

  const email = Email.nominalize('user@host');
  const liveEmail = LiveEmail.nominalize('user@live');

  type _ =
    | AssertTrue<IsEqual<typeof email, x.Nominal<'email', string>>>
    | AssertTrue<
        IsEqual<typeof liveEmail, x.Nominal<'email' | 'live-email', string>>
      >
    | AssertTrue<IsEqual<Parameters<typeof Email['nominalize']>[0], string>>
    | AssertTrue<
        IsEqual<Parameters<typeof LiveEmail['nominalize']>[0], string>
      >;

  expect(email).toBe('user@host');
  expect(liveEmail).toBe('user@live');
});

test('refinement transform', () => {
  const TrimmedNonEmptyString = x.string.refined(value => {
    value = value.trim();
    return x.refinement(value.length > 0, value);
  });

  expect(() => TrimmedNonEmptyString.encode(x.jsonValue, ' abc '))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Expecting encoding value to be stable after refinements."
  `);
  expect(TrimmedNonEmptyString.decode(x.jsonValue, ' def ')).toBe('def');
  expect(
    TrimmedNonEmptyString.transform(x.jsonValue, x.ecmascript, ' ghi '),
  ).toBe('ghi');
  expect(TrimmedNonEmptyString.is(' abc ')).toBe(true);
  expect(TrimmedNonEmptyString.diagnose(' ')).toMatchInlineSnapshot(`
    [
      {
        "message": "Unexpected value.",
        "path": [],
      },
    ]
  `);
});
