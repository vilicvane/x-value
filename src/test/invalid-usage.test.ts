import * as x from '../library';

test('should throw on invalid usages', () => {
  // @ts-expect-error
  expect(() => x.union([])).toThrowErrorMatchingInlineSnapshot(
    `"Expecting at least 2 type for union type"`,
  );
  // @ts-expect-error
  expect(() => x.intersection([])).toThrowErrorMatchingInlineSnapshot(
    `"Expecting at least 2 types for intersection type"`,
  );
});
