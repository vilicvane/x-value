import * as x from '../library/index.js';

test('query string medium should work', () => {
  const Type = x.object({
    foo: x.string,
    bar: x.number,
    flag: x.boolean.optional(),
  });

  expect(Type.decode(x.queryString, 'foo=abc&bar=123&flag=true')).toEqual({
    foo: 'abc',
    bar: 123,
    flag: true,
  });
  expect(Type.decode(x.queryString, 'foo=123&bar=123&flag=0')).toEqual({
    foo: '123',
    bar: 123,
    flag: false,
  });
  expect(Type.decode(x.queryString, 'foo=abc&bar=123')).toEqual({
    foo: 'abc',
    bar: 123,
  });
  expect(
    x
      .object({
        key: x.string,
      })
      .decode(x.queryString, 'key'),
  ).toEqual({
    key: '',
  });
  expect(x.object({}).decode(x.queryString, '')).toEqual({});

  expect(
    Type.encode(x.queryString, {
      foo: 'hello',
      bar: 789,
    }),
  ).toBe('foo=hello&bar=789');
  expect(
    Type.encode(x.queryString, {
      foo: 'hello',
      bar: 789,
      flag: false,
    }),
  ).toBe('foo=hello&bar=789&flag=false');

  expect(() =>
    x.string.encode(x.queryString, 'abc'),
  ).toThrowErrorMatchingInlineSnapshot(
    '"Expected non-null object, got [object String]"',
  );
});
