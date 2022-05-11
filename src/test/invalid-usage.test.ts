import * as x from '../library';

test('should throw on invalid usages', () => {
  expect(() => x.union(...([] as any))).toThrowErrorMatchingInlineSnapshot(
    `"Expecting at least 2 type for union type"`,
  );
  expect(() =>
    x.intersection(...([] as any)),
  ).toThrowErrorMatchingInlineSnapshot(
    `"Expecting at least 2 types for intersection type"`,
  );
});
