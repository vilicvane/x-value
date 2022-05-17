import type {AssertTrue, IsEqual} from 'tslang';

import * as x from '../library';
import type {TypeOf} from '../library';

test('recursive type should work', () => {
  interface RecursiveR {
    type: 'node';
    text?: typeof x.string;
    children: RecursiveR[];
  }

  const R = x.recursive<RecursiveR>(R =>
    x.object({
      type: x.literal('node'),
      children: x.array(R),
    }),
  );

  type R = TypeOf<typeof R>;

  const a: R = {
    type: 'node',
    children: [
      {
        type: 'node',
        children: [],
      },
    ],
  };

  expect(R.encode(x.jsonValue, {...a, text: 'hello'})).toEqual(a);
  expect(R.decode(x.jsonValue, {...a, extra: true} as R)).toEqual(a);
  expect(R.transform(x.jsonValue, x.json, {...a, extra: true} as R)).toBe(
    JSON.stringify(a),
  );

  expect(R.is({type: 'oops', children: []})).toBe(false);

  expect(() => R.encode(x.jsonValue, {} as any))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      [\\"type\\"] Unexpected value.
      [\\"children\\"] Expecting value to be an array, getting [object Undefined]."
  `);
  expect(() =>
    R.decode(x.jsonValue, {
      type: 'node',
      children: ['text'],
    } as any),
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
    } as any),
  ).toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      [\\"children\\"][0][\\"children\\"][0][\\"type\\"] Unexpected value."
  `);

  interface RefR {
    type: 'node';
    text?: string;
    children: RefR[];
  }

  type _ = AssertTrue<IsEqual<R, RefR>>;
});
