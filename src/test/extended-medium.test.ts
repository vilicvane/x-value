import * as x from '../library/index.js';

test('bigint type should work', () => {
  const bigint = BigInt('12345678901234567890');
  const bigintString = bigint.toString();

  expect(x.bigint.is(bigint)).toBe(true);
  expect(x.bigint.is(bigintString)).toBe(false);
  expect(x.bigint.decode(x.extendedJSONValue, bigintString)).toEqual(bigint);
  expect(x.bigint.encode(x.extendedJSONValue, bigint)).toBe(bigintString);
  expect(x.bigint.encode(x.ecmascript, bigint)).toEqual(bigint);

  expect(
    x.object({value: x.bigint}).transform(
      x.extendedJSON,
      x.extendedQueryString,
      JSON.stringify({
        value: bigintString,
      }),
    ),
  ).toBe(
    new URLSearchParams({
      value: bigintString,
    }).toString(),
  );

  expect(
    x.object({value: x.bigint}).transform(
      x.extendedQueryString,
      x.extendedJSON,
      new URLSearchParams({
        value: bigintString,
      }).toString(),
    ),
  ).toBe(
    JSON.stringify({
      value: bigintString,
    }),
  );

  // @ts-expect-error
  expect(() => x.bigint.decode(x.extendedJSONValue, 123))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expected bigint string, got [object Number]"
  `);
});

test('Date type should work', () => {
  const date = new Date();
  const dateString = date.toISOString();

  expect(x.Date.is(date)).toBe(true);
  expect(x.Date.is(dateString)).toBe(false);
  expect(x.Date.decode(x.extendedJSONValue, dateString)).toEqual(date);
  expect(x.Date.encode(x.extendedJSONValue, date)).toBe(dateString);
  expect(x.Date.encode(x.ecmascript, date)).toEqual(date);

  expect(
    x.object({date: x.Date}).transform(
      x.extendedJSON,
      x.extendedQueryString,
      JSON.stringify({
        date,
      }),
    ),
  ).toBe(
    new URLSearchParams({
      date: dateString,
    }).toString(),
  );

  expect(
    x.object({date: x.Date}).transform(
      x.extendedQueryString,
      x.extendedJSON,
      new URLSearchParams({
        date: dateString,
      }).toString(),
    ),
  ).toBe(
    JSON.stringify({
      date,
    }),
  );
});

test('RegExp type should work', () => {
  const regexp = /hello\/world/g;
  const regexpLiteral = `/${regexp.source}/${regexp.flags}`;

  expect(x.RegExp.is(regexp)).toBe(true);
  expect(x.RegExp.is(regexpLiteral)).toBe(false);
  expect(x.RegExp.decode(x.extendedJSONValue, regexpLiteral)).toEqual(regexp);
  expect(x.RegExp.encode(x.extendedJSONValue, regexp)).toBe(regexpLiteral);
  expect(x.RegExp.encode(x.ecmascript, regexp)).toEqual(regexp);

  expect(
    x.object({test: x.RegExp}).transform(
      x.extendedJSON,
      x.extendedQueryString,
      JSON.stringify({
        test: regexpLiteral,
      }),
    ),
  ).toBe(
    new URLSearchParams({
      test: regexpLiteral,
    }).toString(),
  );

  // @ts-expect-error
  expect(() => x.RegExp.decode(x.extendedJSONValue, 123))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expected regular expression literal, got [object Number]"
  `);

  expect(() => x.RegExp.decode(x.extendedJSONValue, ''))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Invalid regular expression literal"
  `);
});
