import * as x from '../../library';
import {TypeConstraintError} from '../../library';
import {Sunday, extendedJSON} from '../@usage';

it('pre-defined atomic types should decode built-in json medium', () => {
  expect(x.nullType.decode(x.json, 'null')).toBe(null);
  expect(x.string.decode(x.json, '"text"')).toBe('text');
  expect(x.number.decode(x.json, '123')).toBe(123);
  expect(x.boolean.decode(x.json, 'true')).toBe(true);
});

it('pre-defined atomic types should error decode built-in json medium with wrong unpacked value', () => {
  expect(() => x.nullType.decode(x.json, '"text"')).toThrow(
    TypeConstraintError,
  );
  expect(() => x.string.decode(x.json, '123')).toThrow(TypeConstraintError);
  expect(() => x.number.decode(x.json, 'true')).toThrow(TypeConstraintError);
  expect(() => x.boolean.decode(x.json, 'null')).toThrow(TypeConstraintError);
});

it('date atomic type should error decoding built-in json medium', () => {
  expect(() =>
    x.Date.decode(x.json, JSON.stringify(new Date().toISOString())),
  ).toThrowError(TypeConstraintError);
});

it('date atomic type should decode extended json medium', () => {
  let date = new Date();

  expect(
    x.Date.decode(extendedJSON, JSON.stringify(date.toISOString())).getTime(),
  ).toBe(date.getTime());
});

it('date atomic refinement sunday should work with extended json medium', () => {
  let sunday = new Date('2022-3-27');
  let monday = new Date('2022-3-28');

  expect(
    Sunday.decode(extendedJSON, JSON.stringify(sunday.toISOString())).getTime(),
  ).toBe(sunday.getTime());

  expect(() =>
    Sunday.decode(extendedJSON, JSON.stringify(monday.toISOString())),
  ).toThrow(TypeConstraintError);

  expect(Sunday.is(sunday)).toBe(true);
  expect(Sunday.is(monday)).toBe(false);
});
