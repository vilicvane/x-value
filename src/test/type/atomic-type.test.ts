import * as x from '../../library';

it('pre-defined atomic types should decode json', () => {
  expect(x.nullType.decode(x.json, 'null')).toBe(null);
  expect(x.string.decode(x.json, '"text"')).toBe('text');
  expect(x.number.decode(x.json, '123')).toBe(123);
  expect(x.boolean.decode(x.json, 'true')).toBe(true);
});
