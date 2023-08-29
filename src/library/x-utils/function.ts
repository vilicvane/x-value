import {
  tuple,
  type RefinedType,
  type Type,
  type TypeInMediumsPartial,
  type TypeOf,
} from '../core';
import {Function} from '../types';

export function fn<
  TArgumentTypeTuple extends
    | []
    | [TypeInMediumsPartial, ...TypeInMediumsPartial[]],
  TReturnType extends TypeInMediumsPartial,
>(
  ArgumentTypeTuple: TArgumentTypeTuple,
  ReturnType: TReturnType,
): RefinedType<
  typeof Function,
  never,
  (
    ...args: {
      [TIndex in keyof TArgumentTypeTuple]: TypeOf<TArgumentTypeTuple[TIndex]>;
    }
  ) => TypeOf<TReturnType>
>;
export function fn<
  TArgumentTypeTuple extends [] | [Type, ...Type[]],
  TReturnType extends Type,
>(
  ArgumentTypeTuple: TArgumentTypeTuple,
  ReturnType: TReturnType,
): RefinedType<typeof Function, never, () => unknown> {
  const ArgumentsType = tuple(ArgumentTypeTuple);

  return Function.refined(
    value =>
      function (this: unknown) {
        return ReturnType.satisfies(
          value.apply(this, ArgumentsType.satisfies([...arguments])),
        );
      },
  );
}

export {fn as function};
