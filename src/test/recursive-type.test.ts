import * as x from '../library';

test('recursive type should work', () => {
  const R = x.recursive(R =>
    x.object({
      type: x.literal('node'),
      children: x.array(R),
    }),
  );

  const a = {
    type: 'node',
    children: [
      {
        type: 'node',
        children: [],
      },
    ],
  };

  expect(R.encode(x.jsonValue, {...a, extra: true})).toEqual(a);
  expect(R.decode(x.jsonValue, {...a, extra: true})).toEqual(a);
  expect(R.transform(x.jsonValue, x.json, {...a, extra: true})).toBe(
    JSON.stringify(a),
  );

  expect(R.is({type: 'oops', children: []})).toBe(false);

  expect(() => R.encode(x.jsonValue, {})).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      [\\"type\\"] Unexpected value.
      [\\"children\\"] Expecting value to be an array, getting [object Undefined]."
  `);
  expect(() =>
    R.decode(x.jsonValue, {
      type: 'node',
      children: ['text'],
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      [\\"children\\"][0] Expecting unpacked value to be a non-null object, getting [object String]."
  `);
  expect(() =>
    R.transform(x.jsonValue, x.json, {
      type: 'node',
      children: [
        {
          type: 'node',
          children: [
            {
              type: 'oops',
              children: [],
            },
          ],
        },
      ],
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      [\\"children\\"][0][\\"children\\"][0][\\"type\\"] Unexpected value."
  `);
});
