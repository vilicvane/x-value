import {__MediumTypeOf} from '../@utils';
import {Medium, MediumTypesPackedType} from '../medium';

import {Type, TypeIssue, TypeOf, TypePath} from './type';

export interface OptionalType<TType> {
  decode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: MediumTypesPackedType<
      TMediumTypes,
      __MediumTypeOf<TType, TMediumTypes, true> | undefined
    >,
  ): TypeOf<TType> | undefined;

  encode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: TypeOf<TType> | undefined,
  ): __MediumTypeOf<TType, TMediumTypes, true> | undefined;

  transform<TFromMediumTypes extends object, TToMediumTypes extends object>(
    from: Medium<TFromMediumTypes>,
    to: Medium<TToMediumTypes>,
    value: MediumTypesPackedType<
      TFromMediumTypes,
      __MediumTypeOf<TType, TFromMediumTypes, true> | undefined
    >,
  ): __MediumTypeOf<TType, TToMediumTypes, true> | undefined;

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
  ): [unknown, TypeIssue[]] {
    if (value === undefined) {
      return [undefined, []];
    } else {
      let [unpacked, issues] = this.Type._encode(medium, value, path);
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
