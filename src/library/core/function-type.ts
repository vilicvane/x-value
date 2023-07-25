import type {Exact} from './@exact-context';
import {
  hasNonDeferrableTypeIssue,
  type TypeIssue,
  type TypePath,
} from './@type-issue';
import type {Medium, UsingMediumName} from './medium';
import {Type, TypeConstraintError} from './type';
import {__type_kind} from './type-partials';
import type {TypeInMediumsPartial, __type_in_mediums} from './type-partials';

const toString = Object.prototype.toString;

export class FunctionType<
  TArgumentTypeTuple extends TypeInMediumsPartial[],
  TReturnType extends TypeInMediumsPartial,
> extends Type<FunctionInMediums<TArgumentTypeTuple, TReturnType>> {
  readonly [__type_kind] = 'function';

  constructor(ArgumentTypeTuple: TArgumentTypeTuple, ReturnType: TReturnType);
  constructor(private ArgumentTypeTuple: Type[], private ReturnType: Type) {
    super();
  }

  guard<TFunction extends this[__type_in_mediums]['value']>(
    fn: TFunction,
  ): this[__type_in_mediums]['value'];
  guard<
    TMedium extends Medium<object>,
    T extends this[__type_in_mediums]['value'],
  >(medium: TMedium, fn: T): this[__type_in_mediums][UsingMediumName<TMedium>];
  guard(...args: [Function] | [Medium, Function]): Function {
    const ArgumentTypeTuple = this.ArgumentTypeTuple;
    const ReturnType = this.ReturnType;

    const exact = this._exact ?? false;

    if (args.length === 1) {
      const [fn] = args;

      return (...args: unknown[]) => {
        if (args.length < ArgumentTypeTuple.length) {
          throw new TypeConstraintError('Failed to call guarded function', [
            {
              path: [],
              message: `Expected at least ${ArgumentTypeTuple.length} argument(s), got ${args.length}.`,
            },
          ]);
        }

        const argumentIssues = ArgumentTypeTuple.flatMap(
          (ArgumentType, index) =>
            ArgumentType._diagnose(args[index], [{argument: index}], exact),
        );

        if (argumentIssues.length > 0) {
          throw new TypeConstraintError(
            'Failed to call guarded function',
            argumentIssues,
          );
        }

        const ret = fn(...args.slice(0, ArgumentTypeTuple.length));

        const returnIssues = ReturnType._diagnose(ret, [], exact);

        if (returnIssues.length > 0) {
          throw new TypeConstraintError(
            'Failed to validate guarded function return value',
            returnIssues,
          );
        }

        return ret;
      };
    } else {
      const [medium, fn] = args;

      return (...args: unknown[]) => {
        if (args.length < ArgumentTypeTuple.length) {
          throw new TypeConstraintError('Failed to call guarded function', [
            {
              path: [],
              message: `Expected at least ${ArgumentTypeTuple.length} argument(s), got ${args.length}.`,
            },
          ]);
        }

        const [decodedArgs, argumentIssues] = ArgumentTypeTuple.reduce(
          (
            [decodedArgs, argumentIssues]: [unknown[], TypeIssue[]],
            ArgumentType,
            index,
          ) => {
            const [arg, issues] = ArgumentType._decode(
              medium,
              args[index],
              [{argument: index}],
              exact,
            );

            return [
              [...decodedArgs, arg],
              [...argumentIssues, ...issues],
            ];
          },
          [[], []],
        );

        if (argumentIssues.length > 0) {
          throw new TypeConstraintError(
            'Failed to call guarded function',
            argumentIssues,
          );
        }

        const ret = fn(...decodedArgs);

        const [encodedReturn, returnIssues] = ReturnType._encode(
          medium,
          ret,
          [],
          exact,
          true,
        );

        if (returnIssues.length > 0) {
          throw new TypeConstraintError(
            'Failed to validate guarded function return value',
            returnIssues,
          );
        }

        return encodedReturn;
      };
    }
  }

  /** @internal */
  override _decode(
    _medium: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]] {
    const issues = this._diagnose(unpacked, path, exact);
    return [hasNonDeferrableTypeIssue(issues) ? undefined : unpacked, issues];
  }

  /** @internal */
  override _encode(
    _medium: Medium,
    value: unknown,
    path: TypePath,
    exact: Exact,
    diagnose: boolean,
  ): [unknown, TypeIssue[]] {
    const issues = diagnose
      ? this._diagnose(value, path, exact)
      : /* istanbul ignore next */ [];
    return [hasNonDeferrableTypeIssue(issues) ? undefined : value, issues];
  }

  /** @internal */
  override _sanitize(value: unknown, path: TypePath): [unknown, TypeIssue[]] {
    const issues = this._diagnose(value, path, 'disabled');
    return [hasNonDeferrableTypeIssue(issues) ? undefined : value, issues];
  }

  /** @internal */
  override _diagnose(
    value: unknown,
    path: TypePath,
    _exact: Exact,
  ): TypeIssue[] {
    if (typeof value !== 'function') {
      return [
        {
          path,
          message: `Expected a function, got ${toString.call(value)}.`,
        },
      ];
    }

    return [];
  }

  /** @internal */
  _toJSONSchema(): never {
    throw new TypeError('Cannot convert Function type to JSON Schema');
  }
}

export function fn<
  TArgumentTypeTuple extends
    | []
    | [TypeInMediumsPartial, ...TypeInMediumsPartial[]],
  TReturnType extends TypeInMediumsPartial,
>(
  ArgumentTypeTuple: TArgumentTypeTuple,
  ReturnType: TReturnType,
): FunctionType<TArgumentTypeTuple, TReturnType> {
  return new FunctionType(ArgumentTypeTuple, ReturnType);
}

export {fn as function};

type FunctionInMediums<
  TArgumentTypeTuple extends TypeInMediumsPartial[],
  TReturnType extends TypeInMediumsPartial,
> = {
  [TMediumName in XValue.UsingName]: FunctionInMedium<
    TArgumentTypeTuple,
    TReturnType,
    TMediumName
  >;
};

type FunctionInMedium<
  TArgumentTypeTuple extends TypeInMediumsPartial[],
  TReturnType extends TypeInMediumsPartial,
  TMediumName extends XValue.UsingName,
> = (
  ...args: {
    [TIndex in keyof TArgumentTypeTuple]: TArgumentTypeTuple[TIndex][__type_in_mediums][TMediumName];
  }
) => TReturnType[__type_in_mediums][TMediumName];
