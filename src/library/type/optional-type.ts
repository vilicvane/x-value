import {Medium, MediumPackedType} from '../medium';

import {Type, TypeIssue, TypeOf} from './type';

export class OptionalType<TType extends Type> extends Type<'optional'> {
  constructor(readonly Type: TType) {
    super();
  }

  decode<TCounterMedium extends Medium<object>>(
    medium: TCounterMedium,
    value: MediumPackedType<TCounterMedium>,
  ): TypeOf<TType> | undefined;
  decode(medium: Medium, value: unknown): unknown {
    return super.decode(medium, value);
  }

  encode<TCounterMedium extends Medium<object>>(
    medium: TCounterMedium,
    value: TypeOf<TType> | undefined,
  ): MediumPackedType<TCounterMedium>;
  encode(medium: Medium, value: unknown): unknown {
    return super.encode(medium, value);
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
