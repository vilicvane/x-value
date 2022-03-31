import {__MediumTypeOf} from '../@utils';
import {Medium, MediumTypesPackedType} from '../medium';

import {Type, TypeIssue, TypeOf} from './type';

export interface ArrayType<TElement> {
  decode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: MediumTypesPackedType<
      TMediumTypes,
      __MediumTypeOf<TElement, TMediumTypes, true>[]
    >,
  ): TypeOf<TElement>[];

  encode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: TypeOf<TElement>[],
  ): MediumTypesPackedType<
    TMediumTypes,
    __MediumTypeOf<TElement, TMediumTypes, true>[]
  >;

  convert<TFromMediumTypes extends object, TToMediumTypes extends object>(
    from: Medium<TFromMediumTypes>,
    to: Medium<TToMediumTypes>,
    value: MediumTypesPackedType<
      TFromMediumTypes,
      __MediumTypeOf<TElement, TFromMediumTypes, true>[]
    >,
  ): MediumTypesPackedType<
    TToMediumTypes,
    __MediumTypeOf<TElement, TToMediumTypes, true>[]
  >;

  is(value: unknown): value is TypeOf<TElement>[];
}

export class ArrayType<TElement extends Type> extends Type<'array'> {
  constructor(readonly Element: TElement) {
    super();
  }

  /** @internal */
  decodeUnpacked(medium: Medium, unpacked: unknown): [unknown, TypeIssue[]] {
    // TODO: implicit conversion to array.

    if (!Array.isArray(unpacked)) {
      return [
        undefined,
        [
          {
            message: `Expecting unpacked value to be an array, getting ${unpacked}.`,
          },
        ],
      ];
    }

    let Element = this.Element;

    let value: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let unpackedElement of unpacked) {
      let [element, entryIssues] = Element.decodeUnpacked(
        medium,
        unpackedElement,
      );

      value.push(element);
      issues.push(...entryIssues);
    }

    return [issues.length === 0 ? value : undefined, issues];
  }

  /** @internal */
  encodeUnpacked(medium: Medium, value: unknown): [unknown, TypeIssue[]] {
    if (!Array.isArray(value)) {
      return [
        undefined,
        [
          {
            message: `Expecting value to be an array, getting ${value}.`,
          },
        ],
      ];
    }

    let Element = this.Element;

    let unpacked: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let valueElement of value) {
      let [unpackedElement, entryIssues] = Element.encodeUnpacked(
        medium,
        valueElement,
      );

      unpacked.push(unpackedElement);
      issues.push(...entryIssues);
    }

    return [issues.length === 0 ? unpacked : undefined, issues];
  }

  /** @internal */
  convertUnpacked(
    from: Medium,
    to: Medium,
    unpacked: unknown,
  ): [unknown, TypeIssue[]] {
    // TODO: implicit conversion to array.

    if (!Array.isArray(unpacked)) {
      return [
        undefined,
        [
          {
            message: `Expecting unpacked value to be an array, getting ${unpacked}.`,
          },
        ],
      ];
    }

    let Element = this.Element;

    let value: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let unpackedElement of unpacked) {
      let [element, entryIssues] = Element.convertUnpacked(
        from,
        to,
        unpackedElement,
      );

      value.push(element);
      issues.push(...entryIssues);
    }

    return [issues.length === 0 ? value : undefined, issues];
  }

  diagnose(value: unknown): TypeIssue[] {
    if (!Array.isArray(value)) {
      return [
        {
          message: `Expecting an array, getting ${value}.`,
        },
      ];
    }

    let Element = this.Element;

    return value.flatMap(element => Element.diagnose(element));
  }
}

export function array<TType extends Type>(type: TType): ArrayType<TType> {
  return new ArrayType(type);
}
