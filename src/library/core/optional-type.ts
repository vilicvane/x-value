import type {Exact} from './@exact-context.js';
import type {
  JSONSchemaContext,
  JSONSchemaData,
  TraverseCallback,
} from './type-like.js';
import {TypeLike} from './type-like.js';
import type {TypeInMediumsPartial, __type_in_mediums} from './type-partials.js';
import {__type_kind} from './type-partials.js';
import type {TypeIssue, TypePath} from './type.js';
import {Type} from './type.js';

export class OptionalType<TType extends TypeInMediumsPartial> extends TypeLike<
  OptionalInMediums<TType>
> {
  readonly [__type_kind] = 'optional';

  constructor(Type: TType);
  constructor(private Type: Type) {
    super();
  }

  /** @internal */
  override _traverse(
    input: unknown,
    path: TypePath,
    exact: Exact,
    callback: TraverseCallback,
  ): [unknown, TypeIssue[]] {
    return input === undefined
      ? [undefined, []]
      : callback(this.Type, input, path, exact);
  }

  /** @internal */
  _toJSONSchema(context: JSONSchemaContext, exact: boolean): JSONSchemaData {
    const {schema} = this.Type._toJSONSchema(context, exact);

    return {
      schema,
      optional: true,
    };
  }
}

type OptionalInMediums<TType extends TypeInMediumsPartial> = {
  [TMediumName in XValue.UsingName]:
    | TType[__type_in_mediums][TMediumName]
    | undefined;
};

declare module './type.js' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Type {
    optional(): OptionalType<this>;
  }
}

Type.prototype.optional = function () {
  return new OptionalType(this);
};
