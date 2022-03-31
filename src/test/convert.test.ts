import * as x from '../library';
import {MediumTypeOf, TypeOf} from '../library';

import {
  Identifier,
  MediumATypes,
  MediumBTypes,
  mediumA,
  mediumB,
} from './@usage';

it('convert medium A to medium B and back', () => {
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

  let value: TypeOf<typeof Type> = {
    id: idBuffer.toString('hex'),
    ...common,
  };

  expect(Type.convert(mediumA, mediumB, a)).toEqual(b);
  expect(Type.convert(mediumB, mediumA, b)).toEqual(a);

  expect(Type.decode(mediumA, a)).toEqual(value);
  expect(Type.decode(mediumB, b)).toEqual(value);

  expect(Type.encode(mediumA, value)).toEqual(a);
  expect(Type.encode(mediumB, value)).toEqual(b);
});
