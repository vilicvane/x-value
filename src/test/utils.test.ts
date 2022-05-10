import type {AssertTrue, IsEqual} from 'tslang';

import * as x from '../library';
import type {TypeOf} from '../library';

test('literal type should work', () => {
  const Foo = x.literal('foo');
  const One = x.literal(1);
  const True = x.literal(true);

  expect(Foo.is('foo')).toBe(true);
  expect(Foo.is('bar')).toBe(false);
  expect(One.is(1)).toBe(true);
  expect(One.is(2)).toBe(false);
  expect(True.is(true)).toBe(true);
  expect(True.is(false)).toBe(false);

  type _ =
    | AssertTrue<IsEqual<TypeOf<typeof Foo>, 'foo'>>
    | AssertTrue<IsEqual<TypeOf<typeof One>, 1>>
    | AssertTrue<IsEqual<TypeOf<typeof True>, true>>;
});

test('literal type should throw on unsupported values', () => {
  expect(() => x.literal({} as any)).toThrow(TypeError);
});

test('equal should work', () => {
  const o = {foo: 'bar'};

  const O = x.equal(o);

  expect(O.is(o)).toBe(true);
  expect(O.is({foo: 'bar'})).toBe(true);
  expect(O.is({})).toBe(false);
  expect(O.is(123)).toBe(false);

  expect(O.encode(x.json, o)).toBe(JSON.stringify(o));
  expect(O.decode(x.json, JSON.stringify(o))).toEqual(o);

  expect(() => O.encode(x.json, {} as any)).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Unexpected value."
  `);
  expect(() => O.decode(x.json, JSON.stringify({})))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Unexpected value."
  `);
});

test('UnknownRecord type should work', () => {
  expect(x.UnknownRecord.is({})).toBe(true);
  expect(x.UnknownRecord.is({key: 'value'})).toBe(true);
  expect(x.UnknownRecord.is([])).toBe(true);
  expect(x.UnknownRecord.is(() => {})).toBe(false);

  let value = {hello: ['world', '!']};

  expect(x.UnknownRecord.decode(x.json, JSON.stringify(value))).toEqual({
    hello: ['world', '!'],
  });
});
