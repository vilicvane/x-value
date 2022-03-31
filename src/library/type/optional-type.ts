import {__MediumTypeOf} from '../@utils';
import {Medium, MediumTypesPackedType} from '../medium';

import {Type, TypeIssue, TypeOf} from './type';

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

  is(value: unknown): value is TypeOf<TType> | undefined;
}

export class OptionalType<TType extends Type> extends Type<'optional'> {
  constructor(readonly Type: TType) {
    super();
  }

  /** @internal */
  decodeUnpacked(medium: Medium, unpacked: unknown): [unknown, TypeIssue[]] {
    if (unpacked === undefined) {
      return [undefined, []];
    } else {
      let [value, issues] = this.Type.decodeUnpacked(medium, unpacked);
      return [issues.length === 0 ? value : undefined, issues];
    }
  }

  /** @internal */
  encodeUnpacked(medium: Medium, value: unknown): [unknown, TypeIssue[]] {
    if (value === undefined) {
      return [undefined, []];
    } else {
      let [unpacked, issues] = this.Type.encodeUnpacked(medium, value);
      return [issues.length === 0 ? unpacked : undefined, issues];
    }
  }

  diagnose(value: unknown): TypeIssue[] {
    return value === undefined ? [] : this.Type.diagnose(value);
  }
}

export function optional<TType extends Type>(Type: TType): OptionalType<TType> {
  return new OptionalType(Type);
}
