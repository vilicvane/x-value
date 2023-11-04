import {
  type RefinedType,
  type Type,
  type TypeInMediumsPartial,
  type TypeOf,
  tuple,
} from '../core/index.js';
import {Function} from '../types.js';

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
      function (this: unknown, ...args: unknown[]) {
        return ReturnType.satisfies(
          value.apply(this, ArgumentsType.satisfies(args)),
        );
      },
  );
}

export {fn as function};
