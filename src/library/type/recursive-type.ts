import type {
  __ElementOrArray,
  __MediumTypeOf,
  __MediumTypesPackedType,
  __RefinedType,
} from '../@internal';
import type {Medium} from '../medium';

import type {TypeConstraint, TypeIssue, TypeOf, TypePath} from './type';
import {Type} from './type';

export interface RecursiveType<TType> {
  refine<TNominalOrRefinement, TNominal = unknown>(
    constraints: __ElementOrArray<TypeConstraint<TypeOf<TType>>>,
  ): __RefinedType<this, TNominalOrRefinement, TNominal>;

  decode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: __MediumTypesPackedType<
      TMediumTypes,
      __MediumTypeOf<TType, TMediumTypes>
    >,
  ): TypeOf<TType>;

  encode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: TypeOf<TType>,
  ): __MediumTypesPackedType<TMediumTypes, __MediumTypeOf<TType, TMediumTypes>>;

  transform<TFromMediumTypes extends object, TToMediumTypes extends object>(
    from: Medium<TFromMediumTypes>,
    to: Medium<TToMediumTypes>,
    value: __MediumTypesPackedType<
      TFromMediumTypes,
      __MediumTypeOf<TType, TFromMediumTypes>
    >,
  ): __MediumTypesPackedType<
    TToMediumTypes,
    __MediumTypeOf<TType, TToMediumTypes>
  >;

  is(value: unknown): value is TypeOf<TType>;
}

export class RecursiveType<TType extends Type> extends Type<'recursive'> {
  readonly Type: TType;

  constructor(recursion: (Type: RecursiveType<TType>) => TType) {
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

export function recursive(
  recursion: (Type: RecursiveType<Type>) => Type,
): RecursiveType<Type> {
  return new RecursiveType(recursion);
}
