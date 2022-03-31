import {Medium} from '../medium';

import {__MediumTypeOf} from './@utils';

export abstract class Type<TCategory extends string = string> {
  protected __static_type_category!: TCategory;

  decode(medium: Medium, packed: unknown): unknown {
    let unpacked = medium.unpack(packed);
    let [value, issues] = this.decodeUnpacked(medium, unpacked);

    if (issues.length > 0) {
      throw new TypeConstraintError(issues);
    }

    return value;
  }

  encode(medium: Medium, value: unknown): unknown {
    let [unpacked, issues] = this.encodeUnpacked(medium, value);

    if (issues.length > 0) {
      throw new TypeConstraintError(issues);
    }

    return medium.pack(unpacked);
  }

  /** @internal */
  abstract decodeUnpacked(
    medium: Medium,
    unpacked: unknown,
  ): [unknown, TypeIssue[]];

  /** @internal */
  abstract encodeUnpacked(
    medium: Medium,
    value: unknown,
  ): [unknown, TypeIssue[]];

  satisfies<T>(value: T): T {
    let issues = this.diagnose(value);

    if (issues.length === 0) {
      return value;
    }

    throw new TypeConstraintError(issues);
  }

  is<T>(value: T): boolean {
    return this.diagnose(value).length === 0;
  }

  abstract diagnose(value: unknown): TypeIssue[];
}

export interface TypeIssue {
  message: string;
}

export type TypeConstraint<T = unknown> = (value: T) => string | boolean;

export class TypeConstraintError extends TypeError {
  constructor(readonly issues: TypeIssue[]) {
    super();
  }
}

export type TypeOf<TType extends Type> = __MediumTypeOf<TType, XValue.Types>;
