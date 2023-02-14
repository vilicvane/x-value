import type {Exact} from './@exact-context';
import type {TypeIssue, TypePath} from './@type-issue';
import type {Medium} from './medium';
import {Type} from './type';
import type {JSONSchemaContext, JSONSchemaData} from './type-like';
import {__type_kind} from './type-partials';
import type {TypeInMediumsPartial, __type_in_mediums} from './type-partials';

export class RecursiveType<T> extends Type<RecursiveInMediums<T>> {
  readonly [__type_kind] = 'recursive';

  private Type: Type;

  constructor(recursion: (Type: RecursiveType<T>) => TypeInMediumsPartial);
  constructor(recursion: (Type: RecursiveType<T>) => Type) {
    super();

    this.Type = recursion(this);
  }

  /** @internal */
  _decode(
    medium: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]] {
    return this.Type._decode(medium, unpacked, path, exact);
  }

  /** @internal */
  _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
    exact: Exact,
    diagnose: boolean,
  ): [unknown, TypeIssue[]] {
    return this.Type._encode(medium, value, path, exact, diagnose);
  }

  /** @internal */
  _transform(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]] {
    return this.Type._transform(from, to, unpacked, path, exact);
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath, exact: Exact): TypeIssue[] {
    return this.Type._diagnose(value, path, exact);
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
