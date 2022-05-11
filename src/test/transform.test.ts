import * as x from '../library';
import type {MediumTypeOf, TypeOf} from '../library';

import type {MediumATypes, MediumBTypes} from './@usage';
import {Identifier, mediumA, mediumB} from './@usage';

test('transform medium A to medium B and back', () => {
  const Type = x.object({
    id: Identifier,
    name: x.string,
    data: x.array(
      x.intersection(
        x.object({
          x: x.union(x.number, x.string),
        }),
        x.object({
          y: x.optional(x.number),
        }),
      ),
    ),
  });

  let idBuffer = Buffer.from([0x12, 0x34]);

  let common: Omit<TypeOf<typeof Type>, 'id'> = {
    name: 'common',
    data: [
      {
        x: 123,
        y: 456,
      },
      {
        x: 'abc',
        y: 456,
      },
      {
        x: 'abc',
      },
    ],
  };

  let a: MediumTypeOf<typeof Type, MediumATypes> = {
    id: idBuffer,
    ...common,
  };

  let b: MediumTypeOf<typeof Type, MediumBTypes> = {
    id: idBuffer.readUint16BE(),
    ...common,
  };

  let c = {
    id: idBuffer,
    ...common,
    data: 123,
  };

  let d = {
    id: idBuffer,
    ...common,
    data: [123, {x: true, y: 'abc'}],
  };

  let value: TypeOf<typeof Type> = {
    id: idBuffer.toString('hex'),
    ...common,
  };

  expect(Type.transform(mediumA, mediumB, a)).toEqual(b);
  expect(Type.transform(mediumB, mediumA, b)).toEqual(a);
  expect(() => Type.transform(mediumA, mediumB, b as any)).toThrow(TypeError);
  expect(() => Type.transform(mediumB, mediumA, a as any)).toThrow(TypeError);
  expect(() => Type.transform(mediumA, mediumB, c as any))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      [\\"data\\"] Expecting unpacked value to be an array, getting [object Number]."
  `);
  // The duplicates are the result of the intersection type, leave it as-is for
  // now.
  expect(() => Type.transform(mediumA, mediumB, d as any))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      [\\"data\\"][0] Expecting unpacked value to be a non-null object, getting [object Number].
      [\\"data\\"][0] Expecting unpacked value to be a non-null object, getting [object Number].
      [\\"data\\"][1][\\"x\\"] The unpacked value satisfies none of the type in the union type.
      [\\"data\\"][1][\\"x\\"] Expected string, getting [object Boolean].
      [\\"data\\"][1][\\"y\\"] Expected number, getting [object String]."
  `);

  expect(Type.decode(mediumA, a)).toEqual(value);
  expect(Type.decode(mediumB, b)).toEqual(value);

  expect(Type.encode(mediumA, value)).toEqual(a);
  expect(Type.encode(mediumB, value)).toEqual(b);
});

test('transform should work with refined type', () => {
  const O = x
    .object({
      foo: x.string,
    })
    .refine(value => value.foo === 'abc');

  let value = {foo: 'abc'};

  expect(O.transform(x.json, x.jsonValue, JSON.stringify(value))).toEqual(
    value,
  );

  expect(() => O.transform(x.json, x.jsonValue, JSON.stringify({foo: 'def'})))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      Unexpected value."
  `);
});
