import {Medium, MediumPackedType} from '../medium';

import {Type, TypeIssue, TypeOf} from './type';

export class ArrayType<TElement extends Type> extends Type<'array'> {
  constructor(readonly Element: TElement) {
    super();
  }

  decode<TCounterMedium extends Medium<object>>(
    medium: TCounterMedium,
    value: MediumPackedType<TCounterMedium>,
  ): TypeOf<TElement>[];
  decode(medium: Medium, value: unknown): unknown {
    return super.decode(medium, value);
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
