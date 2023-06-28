import * as x from '../library';

import {Identifier, mediumA, mediumB} from './@usage';

test('transform medium A to medium B and back', () => {
  const Type = x.object({
    id: Identifier,
    name: x.string,
    data: x.array(
      x.intersection([
        x.object({
          x: x.union([x.number, x.string]),
        }),
        x.object({
          y: x.number.optional(),
        }),
      ]),
    ),
  });

  const idBuffer = Buffer.from([0x12, 0x34]);

  const common: Omit<x.TypeOf<typeof Type>, 'id'> = {
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

  const a: x.MediumTypeOf<'medium-a', typeof Type> = {
    id: idBuffer,
    ...common,
  };

  const b: x.MediumTypeOf<'medium-b', typeof Type> = {
    id: idBuffer.readUint16BE(),
    ...common,
  };

  const c = {
    id: idBuffer,
    ...common,
    data: 123,
  };

  const d = {
    id: idBuffer,
    ...common,
    data: [123, {x: true, y: 'abc'}],
  };

  const value: x.TypeOf<typeof Type> = {
    id: idBuffer.toString('hex'),
    ...common,
  };

  expect(Type.transform(mediumA, mediumB, a)).toEqual(b);
  expect(Type.transform(mediumB, mediumA, b)).toEqual(a);
  // @ts-expect-error
  expect(() => Type.transform(mediumA, mediumB, b)).toThrow(TypeError);
  // @ts-expect-error
  expect(() => Type.transform(mediumB, mediumA, a)).toThrow(TypeError);
  // @ts-expect-error
  expect(() => Type.transform(mediumA, mediumB, c))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      ["data"] Expected an array, got [object Number]."
  `);
  // The duplicates are the result of the intersection type, leave it as-is for
  // now.
  // @ts-expect-error
  expect(() => Type.transform(mediumA, mediumB, d))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      ["data"][0] Expected a non-null object, got [object Number].
      ["data"][0] Expected a non-null object, got [object Number].
      ["data"][1]["x"] Value satisfies none of the type in the union type.
      ["data"][1]["x"] Expected number, got [object Boolean].
      ["data"][1]["y"] Expected number, got [object String]."
  `);

  expect(Type.decode(mediumA, a)).toEqual(value);
  expect(Type.decode(mediumB, b)).toEqual(value);

  expect(Type.encode(mediumA, value)).toEqual(a);
  expect(Type.encode(mediumB, value)).toEqual(b);

  expect(() => Identifier.encode(mediumA, ''))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Value cannot be empty string"
  `);

  expect(() => Identifier.transform(mediumA, mediumB, Buffer.from([])))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      Value cannot be empty string"
  `);
});

test('transform should work with refined type', () => {
  const O = x
    .object({
      foo: x.string,
    })
    .refined(value => x.refinement(value.foo === 'abc', value));

  const value = {foo: 'abc'};

  expect(O.transform(x.json, x.jsonValue, JSON.stringify(value))).toEqual(
    value,
  );

  expect(() => O.transform(x.json, x.jsonValue, JSON.stringify({foo: 'def'})))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      Unexpected value."
  `);
});
