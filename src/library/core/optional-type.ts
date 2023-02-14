import type {Exact} from './@exact-context';
import type {TypeIssue, TypePath} from './@type-issue';
import type {Medium} from './medium';
import {Type} from './type';
import type {JSONSchemaContext, JSONSchemaData} from './type-like';
import {TypeLike} from './type-like';
import type {TypeInMediumsPartial, __type_in_mediums} from './type-partials';
import {__type_kind} from './type-partials';

export class OptionalType<TType extends TypeInMediumsPartial> extends TypeLike<
  OptionalInMediums<TType>
> {
  readonly [__type_kind] = 'optional';

  constructor(Type: TType);
  constructor(private Type: Type) {
    super();
  }

  /** @internal */
  _decode(
    medium: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]] {
    return unpacked === undefined
      ? [undefined, []]
      : this.Type._decode(medium, unpacked, path, exact);
  }

  /** @internal */
  _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
    exact: Exact,
    diagnose: boolean,
  ): [unknown, TypeIssue[]] {
    return value === undefined
      ? [undefined, []]
      : this.Type._encode(medium, value, path, exact, diagnose);
  }

  /** @internal */
  _transform(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]] {
    return unpacked === undefined
      ? [undefined, []]
      : this.Type._transform(from, to, unpacked, path, exact);
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath, exact: Exact): TypeIssue[] {
    return value === undefined ? [] : this.Type._diagnose(value, path, exact);
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

declare module './type' {
  interface Type {
    optional(): OptionalType<this>;
  }
}

Type.prototype.optional = function () {
  return new OptionalType(this);
};
