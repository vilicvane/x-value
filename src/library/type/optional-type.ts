import type {
  __ElementOrArray,
  __MediumTypeOf,
  __MediumTypesPackedType,
} from '../@utils';
import type {Medium} from '../medium';
import type {Nominal} from '../utils';

import type {RefinedType} from './refined-type';
import type {TypeConstraint, TypeIssue, TypeOf, TypePath} from './type';
import {Type} from './type';

export interface OptionalType<TType> {
  refine<TNominal>(
    constraints: __ElementOrArray<TypeConstraint<TypeOf<TType> | undefined>>,
  ): RefinedType<this, Nominal<TNominal>>;

  decode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: __MediumTypesPackedType<
      TMediumTypes,
      __MediumTypeOf<TType, TMediumTypes> | undefined
    >,
  ): TypeOf<TType> | undefined;

  encode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: TypeOf<TType> | undefined,
  ): __MediumTypesPackedType<
    TMediumTypes,
    __MediumTypeOf<TType, TMediumTypes> | undefined
  >;

  transform<TFromMediumTypes extends object, TToMediumTypes extends object>(
    from: Medium<TFromMediumTypes>,
    to: Medium<TToMediumTypes>,
    value: __MediumTypesPackedType<
      TFromMediumTypes,
      __MediumTypeOf<TType, TFromMediumTypes> | undefined
    >,
  ): __MediumTypesPackedType<
    TToMediumTypes,
    __MediumTypeOf<TType, TToMediumTypes> | undefined
  >;

  is(value: unknown): value is TypeOf<TType> | undefined;
}

export class OptionalType<TType extends Type> extends Type<'optional'> {
  constructor(readonly Type: TType) {
    super();
  }

  /** @internal */
  _decode(
    medium: Medium,
    unpacked: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]] {
    if (unpacked === undefined) {
      return [undefined, []];
    } else {
      let [value, issues] = this.Type._decode(medium, unpacked, path);
      return [issues.length === 0 ? value : undefined, issues];
    }
  }

  /** @internal */
  _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
    diagnose: boolean,
  ): [unknown, TypeIssue[]] {
    if (value === undefined) {
      return [undefined, []];
    } else {
      let [unpacked, issues] = this.Type._encode(medium, value, path, diagnose);
      return [issues.length === 0 ? unpacked : undefined, issues];
    }
  }

  /** @internal */
  _transform(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]] {
    if (unpacked === undefined) {
      return [undefined, []];
    } else {
      let [transformedUnpacked, issues] = this.Type._transform(
        from,
        to,
        unpacked,
        path,
      );
      return [issues.length === 0 ? transformedUnpacked : undefined, issues];
    }
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath): TypeIssue[] {
    return value === undefined ? [] : this.Type._diagnose(value, path);
  }
}

export function optional<TType extends Type>(Type: TType): OptionalType<TType> {
  return new OptionalType(Type);
}
