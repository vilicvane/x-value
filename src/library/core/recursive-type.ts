import type {Exact} from './@exact-context';
import type {TypeIssue, TypePath} from './@type-issue';
import type {Medium} from './medium';
import {Type} from './type';
import type {JSONSchemaContext, JSONSchemaData} from './type-like';
import {__type_kind} from './type-partials';
import type {TypeInMediumsPartial} from './type-partials';

export class RecursiveType<TRecursive> extends Type<
  RecursiveInMediums<TRecursive>
> {
  readonly [__type_kind] = 'recursive';

  private Type: Type;

  constructor(
    recursion: (Type: RecursiveType<TRecursive>) => TypeInMediumsPartial,
  );
  constructor(recursion: (Type: RecursiveType<TRecursive>) => Type) {
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
  _toJSONSchema(context: JSONSchemaContext): JSONSchemaData {
    const schema = context.getDefinition(this);

    if (schema) {
      return {
        schema,
      };
    } else {
      context.define(this);

      const {schema} = this.Type._toJSONSchema(context);

      return {
        schema: context.define(this, schema),
      };
    }
  }

  private static jsonSchemaContext:
    | Map<RecursiveType<unknown>, string>
    | undefined;
}

export function recursive<T>(
  recursion: (Type: RecursiveType<T>) => TypeInMediumsPartial,
): RecursiveType<T> {
  return new RecursiveType(recursion);
}

type RecursiveInMediums<TRecursive> = {
  [TMediumName in XValue.UsingName]: RecursiveInMedium<TRecursive, TMediumName>;
};

type RecursiveInMedium<
  TRecursive,
  TMediumName extends XValue.UsingName,
> = TRecursive extends TypeInMediumsPartial<infer TInMediums>
  ? TInMediums[TMediumName]
  : {
      [TKey in keyof TRecursive]: RecursiveInMedium<
        TRecursive[TKey],
        TMediumName
      >;
    };
