import * as x from '../library';

test('sanitize should work', () => {
  const fn_1 = (): void => {};

  expect(x.string.sanitize('abc')).toBe('abc');

  expect(
    x
      .object({
        foo: x.string,
        fn: x.function([], x.void),
      })
      .sanitize({
        foo: 'abc',
        bar: 123,
        fn: fn_1,
      }),
  ).toEqual({
    foo: 'abc',
    fn: fn_1,
  });

  expect(
    x
      .object({
        foo: x.string,
        fn: x.function([], x.void).optional(),
      })
      .exact()
      .sanitize({
        foo: 'abc',
        bar: 123,
        fn: fn_1,
      }),
  ).toEqual({
    foo: 'abc',
    fn: fn_1,
  });

  expect(
    x
      .object({
        foo: x.string,
        bar: x.union([x.number, x.string]),
        fn: x.function([], x.void).optional(),
      })
      .sanitize({
        foo: 'abc',
        bar: 123,
      }),
  ).toEqual({
    foo: 'abc',
    bar: 123,
  });

  expect(
    x
      .object({
        foo: x.string.refined(value => x.refinement(true, value.trim())),
        bar: x.intersection([
          x.object({
            x: x.number,
          }),
          x.object({
            y: x.union([x.boolean, x.number]),
          }),
        ]),
      })
      .sanitize({
        foo: ' abc ',
        bar: {
          x: 123,
          y: 456,
          z: 789,
        },
        extra: true,
      }),
  ).toEqual({
    foo: 'abc',
    bar: {
      x: 123,
      y: 456,
    },
  });

  expect(() => x.string.sanitize(123)).toThrowErrorMatchingInlineSnapshot(`
    "Value does not satisfy the type:
      Expected string, got [object Number]."
  `);
  expect(() =>
    x.string.refined(value => x.refinement(false, value)).sanitize('abc'),
  ).toThrowErrorMatchingInlineSnapshot(`
    "Value does not satisfy the type:
      Unexpected value."
  `);
  expect(() =>
    x.string.refined(value => x.refinement(false, value)).sanitize(123),
  ).toThrowErrorMatchingInlineSnapshot(`
    "Value does not satisfy the type:
      Expected string, got [object Number]."
  `);
  expect(() => x.function([], x.void).sanitize(123))
    .toThrowErrorMatchingInlineSnapshot(`
    "Value does not satisfy the type:
      Expected a function, got [object Number]."
  `);
});
