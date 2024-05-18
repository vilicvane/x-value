import * as x from '../library/index.js';

test('command line medium should work', () => {
  expect(
    x
      .object({
        foo: x.string,
        bar: x.number,
        pia: x.boolean,
      })
      .decode(x.commandLine, ['--foo=abc', '--bar=123', '--pia']),
  ).toEqual({
    foo: 'abc',
    bar: 123,
    pia: true,
  });

  expect(
    x.tuple([x.string, x.boolean]).decode(x.commandLine, ['abc', 'false']),
  ).toEqual(['abc', false]);

  {
    const Type = x.tuple([x.string, x.boolean.optional()]);

    expect(Type.decode(x.commandLine, ['abc', 'false'])).toEqual([
      'abc',
      false,
    ]);

    expect(Type.decode(x.commandLine, ['abc'])).toEqual(['abc']);

    expect(() => Type.decode(x.commandLine, ['abc', 'false', 'true']))
      .toThrowErrorMatchingInlineSnapshot(`
"Failed to decode from medium:
  Expected value with 1 to 2 instead of 3 element(s)."
`);
  }

  expect(
    x
      .intersection([
        x.tuple([x.string]),
        x.object({flag: x.boolean, pia: x.number.optional()}),
      ])
      .decode(x.commandLine, ['abc', '--flag']),
  ).toEqual(Object.assign(['abc'], {flag: true}));

  expect(() => x.tuple([x.boolean]).decode(x.commandLine, ['abc']))
    .toThrowErrorMatchingInlineSnapshot(`
"Failed to decode from medium:
  [0] Expected true/1/false/0, got [object String]"
`);

  expect(() =>
    x.tuple([x.boolean]).encode(x.commandLine, [true]),
  ).toThrowErrorMatchingInlineSnapshot('"Not implemented"');
});
