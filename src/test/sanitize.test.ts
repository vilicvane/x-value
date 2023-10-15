import * as x from '../library/index.js';

test('sanitize should work', () => {
  const fn_1 = (): void => {};

  expect(x.string.sanitize('abc')).toBe('abc');

  const sanitized_1 = x
    .object({
      foo: x.string,
      fn: x.function([], x.void),
    })
    .sanitize({
      foo: 'abc',
      bar: 123,
      fn: fn_1,
    });

  expect(sanitized_1.fn()).toBe(undefined);

  expect(() => (sanitized_1.fn as any)(123))
    .toThrowErrorMatchingInlineSnapshot(`
    "Value does not satisfy the type:
      Expected value with 0 instead of 1 element(s)."
  `);

  expect(sanitized_1).toEqual({
    foo: 'abc',
    fn: sanitized_1.fn,
  });

  const sanitized_2 = x
    .object({
      foo: x.string,
      fn: x.function([], x.void).optional(),
    })
    .exact()
    .sanitize({
      foo: 'abc',
      bar: 123,
      fn: fn_1,
    });

  expect(sanitized_2).toEqual({
    foo: 'abc',
    fn: sanitized_2.fn,
  });

  const sanitized_3 = x
    .object({
      foo: x.string,
      bar: x.union([x.number, x.string]),
      fn: x.function([], x.void).optional(),
    })
    .sanitize({
      foo: 'abc',
      bar: 123,
    });

  expect(sanitized_3).toEqual({
    foo: 'abc',
    bar: 123,
  });

  const sanitized_4 = x
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
    });

  expect(sanitized_4).toEqual({
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
      Expected function, got [object Number]."
  `);
});
