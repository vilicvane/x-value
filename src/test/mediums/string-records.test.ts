import * as x from '../../library/index.js';

test('string records should work', () => {
  const Type_1 = x.object({
    foo: x.number,
    bar: x.boolean,
    pia: x.string,
    date: x.Date.optional(),
  });

  const date = new Date();

  expect(
    Type_1.decode(x.stringRecords, {
      foo: '123',
      bar: 'true',
      pia: 'abc',
      date: date.toISOString(),
    }),
  ).toEqual({
    foo: 123,
    bar: true,
    pia: 'abc',
    date,
  });

  expect(
    Type_1.encode(x.stringRecords, {
      foo: 123,
      bar: true,
      pia: 'abc',
    }),
  ).toEqual({
    foo: '123',
    bar: 'true',
    pia: 'abc',
  });

  const Type_2 = x.null;

  expect(Type_2.decode(x.stringRecords, 'null')).toBe(null);
  expect(Type_2.encode(x.stringRecords, null)).toBe('null');

  expect(() =>
    // @ts-expect-error
    Type_2.decode(x.stringRecords, 'undefined'),
  ).toThrowErrorMatchingInlineSnapshot(`
"Failed to decode from medium:
  Expected "null", got [object String]"
`);
});
