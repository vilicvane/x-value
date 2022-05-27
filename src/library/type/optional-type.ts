import type {Medium} from '../medium';

import type {
  Exact,
  Type,
  TypeInMediumsPartial,
  TypeIssue,
  TypePath,
  __type_in_mediums,
} from './type';
import {TypeLike, __type_kind} from './type';

export class OptionalType<TType extends TypeInMediumsPartial> extends TypeLike<
  OptionalInMediums<TType>
> {
  [__type_kind]!: 'optional';

  constructor(Type: TType);
  constructor(readonly Type: Type) {
    super();
  }

  /** @internal */
  _decode(
    medium: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]] {
    if (unpacked === undefined) {
      return [undefined, []];
    } else {
      let [value, issues] = this.Type._decode(medium, unpacked, path, exact);
      return [issues.length === 0 ? value : undefined, issues];
    }
  }

  /** @internal */
  _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
    exact: Exact,
    diagnose: boolean,
  ): [unknown, TypeIssue[]] {
    if (value === undefined) {
      return [undefined, []];
    } else {
      let [unpacked, issues] = this.Type._encode(
        medium,
        value,
        path,
        exact,
        diagnose,
      );
      return [issues.length === 0 ? unpacked : undefined, issues];
    }
  }

  /** @internal */
  _transform(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]] {
    if (unpacked === undefined) {
      return [undefined, []];
    } else {
      let [transformedUnpacked, issues] = this.Type._transform(
        from,
        to,
        unpacked,
        path,
        exact,
      );
      return [issues.length === 0 ? transformedUnpacked : undefined, issues];
    }
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath, exact: Exact): TypeIssue[] {
    return value === undefined ? [] : this.Type._diagnose(value, path, exact);
  }
}

type OptionalInMediums<TType extends TypeInMediumsPartial> = {
  [TMediumName in XValue.UsingName]:
    | TType[__type_in_mediums][TMediumName]
    | undefined;
};
