import * as x from '../library';

it('literal type should work', () => {
  const Foo = x.literal('foo');
  const One = x.literal(1);
  const True = x.literal(true);

  expect(Foo.is('foo')).toBe(true);
  expect(Foo.is('bar')).toBe(false);
  expect(One.is(1)).toBe(true);
  expect(One.is(2)).toBe(false);
  expect(True.is(true)).toBe(true);
  expect(True.is(false)).toBe(false);
});

it('literal type should throw on unsupported values', () => {
  expect(() => x.literal({} as any)).toThrow(TypeError);
});
