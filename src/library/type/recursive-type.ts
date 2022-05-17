import type {
  __ElementOrArray,
  __MediumTypeOf,
  __MediumTypesPackedType,
  __RecursiveMediumType,
  __RefinedType,
} from '../@internal';
import type {Medium} from '../medium';

import type {TypeConstraint, TypeIssue, TypePath} from './type';
import {Type} from './type';

export interface RecursiveType<T> {
  refine<TNominalOrRefinement, TNominal = unknown>(
    constraints: __ElementOrArray<
      TypeConstraint<__RecursiveMediumType<T, XValue.Types>>
    >,
  ): __RefinedType<this, TNominalOrRefinement, TNominal>;

  decode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: __MediumTypesPackedType<
      TMediumTypes,
      __RecursiveMediumType<T, TMediumTypes>
    >,
  ): __RecursiveMediumType<T, XValue.Types>;

  encode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: __RecursiveMediumType<T, XValue.Types>,
  ): __MediumTypesPackedType<
    TMediumTypes,
    __RecursiveMediumType<T, TMediumTypes>
  >;

  transform<TFromMediumTypes extends object, TToMediumTypes extends object>(
    from: Medium<TFromMediumTypes>,
    to: Medium<TToMediumTypes>,
    value: __MediumTypesPackedType<
      TFromMediumTypes,
      __RecursiveMediumType<T, TFromMediumTypes>
    >,
  ): __MediumTypesPackedType<
    TToMediumTypes,
    __RecursiveMediumType<T, TToMediumTypes>
  >;

  is(value: unknown): value is __RecursiveMediumType<T, XValue.Types>;
}

export class RecursiveType<T> extends Type<'recursive'> {
  readonly Type: Type;

  constructor(recursion: (Type: RecursiveType<T>) => Type) {
    super();

    this.Type = recursion(this);
  }

  /** @internal */
  _decode(
    medium: Medium,
    unpacked: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]] {
    let [value, issues] = this.Type._decode(medium, unpacked, path);
    return [issues.length === 0 ? value : undefined, issues];
  }

  /** @internal */
  _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
    diagnose: boolean,
  ): [unknown, TypeIssue[]] {
    let [unpacked, issues] = this.Type._encode(medium, value, path, diagnose);
    return [issues.length === 0 ? unpacked : undefined, issues];
  }

  /** @internal */
  _transform(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]] {
    let [transformedUnpacked, issues] = this.Type._transform(
      from,
      to,
      unpacked,
      path,
    );
    return [issues.length === 0 ? transformedUnpacked : undefined, issues];
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath): TypeIssue[] {
    return this.Type._diagnose(value, path);
  }
}

export function recursive<T>(
  recursion: (Type: RecursiveType<T>) => Type,
): RecursiveType<T> {
  return new RecursiveType(recursion);
}
