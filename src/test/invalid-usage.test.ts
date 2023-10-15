import * as x from '../library/index.js';

test('should throw on invalid usages', () => {
  // @ts-expect-error
  expect(() => x.union([])).toThrowErrorMatchingInlineSnapshot(
    `"Expected at least 2 elements for union type"`,
  );
  // @ts-expect-error
  expect(() => x.intersection([])).toThrowErrorMatchingInlineSnapshot(
    `"Expected at least 2 elements for intersection type"`,
  );
});
