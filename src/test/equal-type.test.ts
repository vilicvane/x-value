import * as x from '../library';

test('ref type should work', () => {
  const o = {};

  const O = x.equal(o);

  expect(O.is(o)).toBe(true);
  expect(O.is({})).toBe(false);
});

test('struct type should work', () => {
  const o = {
    foo: 'abc',
  };

  const O = x.deepEqual(o);

  expect(O.is(o)).toBe(true);
  expect(O.is({foo: 'abc'})).toBe(true);
  expect(O.is({})).toBe(false);
});
