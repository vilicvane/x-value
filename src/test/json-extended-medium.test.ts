import * as x from '../library';

test('undefined type should work', () => {
  expect(x.undefined.decode(x.extendedJSONValue, null)).toBe(undefined);
  expect(x.undefined.encode(x.extendedJSONValue, undefined)).toBe(null);

  expect(
    x.object({value: x.undefined}).transform(
      x.extendedJSON,
      x.extendedJSONValue,
      JSON.stringify({
        value: null,
      }),
    ),
  ).toEqual({
    value: null,
  });

  expect(
    x
      .object({value: x.undefined})
      .transform(x.extendedJSONValue, x.extendedJSON, {
        value: null,
      }),
  ).toEqual(
    JSON.stringify({
      value: null,
    }),
  );

  expect(() =>
    // @ts-expect-error
    x.undefined.encode(x.extendedJSONValue, 123),
  ).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Expected undefined, got [object Number]."
  `);

  expect(() =>
    // @ts-expect-error
    x.undefined.decode(x.extendedJSONValue, 123),
  ).toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expected undefined/null, got [object Number]"
  `);
});
