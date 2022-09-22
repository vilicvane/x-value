import type {Exact} from './@exact-context';
import type {TypeIssue, TypePath} from './@type-issue';
import type {Medium} from './medium';
import {__type_in_mediums, __type_kind} from './type-partials';
import type {TypesInMediums} from './type-partials';

export abstract class TypeLike<
  TInMediums extends TypesInMediums = TypesInMediums,
> {
  [__type_kind]!: string;

  [__type_in_mediums]!: TInMediums;

  /** @internal */
  abstract _decode(
    medium: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]];

  /** @internal */
  abstract _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
    exact: Exact,
    diagnose: boolean,
  ): [unknown, TypeIssue[]];

  /** @internal */
  abstract _transform(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]];

  /** @internal */
  abstract _diagnose(value: unknown, path: TypePath, exact: Exact): TypeIssue[];
}
