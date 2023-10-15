import type {Exact} from './@exact-context.js';
import type {TypeIssue, TypePath} from './@type-issue.js';
import type {
  JSONSchemaContext,
  JSONSchemaData,
  TraverseCallback,
} from './type-like.js';
import type {TypeInMediumsPartial, __type_in_mediums} from './type-partials.js';
import {__type_kind} from './type-partials.js';
import {Type} from './type.js';

export class RecursiveType<T> extends Type<RecursiveInMediums<T>> {
  readonly [__type_kind] = 'recursive';

  private Type: Type;

  constructor(recursion: (Type: RecursiveType<T>) => TypeInMediumsPartial);
  constructor(recursion: (Type: RecursiveType<T>) => Type) {
    super();

    this.Type = recursion(this);
  }

  /** @internal */
  override _traverse(
    input: unknown,
    path: TypePath,
    exact: Exact,
    callback: TraverseCallback,
  ): [unknown, TypeIssue[]] {
    return callback(this.Type, input, path, exact);
  }

  /** @internal */
  _toJSONSchema(context: JSONSchemaContext, exact: boolean): JSONSchemaData {
    exact = this._exact ?? exact;

    const schema = context.getDefinition(this, exact);

    if (schema) {
      return {
        schema,
      };
    } else {
      context.define(this, exact);

      const {schema} = this.Type._toJSONSchema(context, exact);

      return {
        schema: context.define(this, exact, schema),
      };
    }
  }
}

export function recursive<T>(
  recursion: (Type: RecursiveType<T>) => TypeInMediumsPartial,
): RecursiveType<T> {
  return new RecursiveType(recursion);
}

export type Recursive<
  TRecursivePartial,
  TNonRecursivePartial extends TypeInMediumsPartial = TypeInMediumsPartial,
> = TypeInMediumsPartial<RecursivePartialInMediums<TRecursivePartial>> &
  TNonRecursivePartial;

type RecursivePartialInMediums<TRecursivePartial> = {
  [TMediumName in XValue.UsingName]: RecursivePartialInMedium<
    TRecursivePartial,
    TMediumName
  >;
};

type RecursivePartialInMedium<
  TRecursivePartial,
  TMediumName extends XValue.UsingName,
> = TRecursivePartial extends TypeInMediumsPartial<infer TInMediums> | undefined
  ? TRecursivePartial extends undefined
    ? undefined
    : RecursivePartialInMedium<TInMediums[TMediumName], TMediumName>
  : TRecursivePartial extends Function
  ? TRecursivePartial
  : {
      [TKey in keyof TRecursivePartial]: RecursivePartialInMedium<
        TRecursivePartial[TKey],
        TMediumName
      >;
    };

type RecursiveInMediums<T> = T extends TypeInMediumsPartial
  ? T[__type_in_mediums]
  : {
      [TMediumName in XValue.UsingName]: RecursiveInMedium<T, TMediumName>;
    };

type RecursiveInMedium<
  TRecursive,
  TMediumName extends XValue.UsingName,
> = TRecursive extends TypeInMediumsPartial<infer TInMediums>
  ? TInMediums[TMediumName]
  : TRecursive extends Function
  ? TRecursive
  : {
      [TKey in keyof TRecursive]: RecursiveInMedium<
        TRecursive[TKey],
        TMediumName
      >;
    };
