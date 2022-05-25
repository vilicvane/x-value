import {toString} from '../@internal';
import type {Medium} from '../medium';

import type {
  TypeInMediumsPartial,
  TypeIssue,
  TypePath,
  __type_in_mediums,
} from './type';
import {Type, __type_kind} from './type';

export class ArrayType<TElementType extends TypeInMediumsPartial> extends Type<
  ArrayInMediums<TElementType>
> {
  [__type_kind]!: 'array';

  constructor(ElementType: TElementType);
  constructor(readonly ElementType: Type) {
    super();
  }

  /** @internal */
  _decode(
    medium: Medium,
    unpacked: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]] {
    // TODO: implicit conversion to array.

    if (!Array.isArray(unpacked)) {
      return [
        undefined,
        [
          {
            path,
            message: `Expecting unpacked value to be an array, getting ${toString.call(
              unpacked,
            )}.`,
          },
        ],
      ];
    }

    let ElementType = this.ElementType;

    let value: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let [index, unpackedElement] of unpacked.entries()) {
      let [element, entryIssues] = ElementType._decode(
        medium,
        unpackedElement,
        [...path, index],
      );

      value.push(element);
      issues.push(...entryIssues);
    }

    return [issues.length === 0 ? value : undefined, issues];
  }

  /** @internal */
  _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
    diagnose: boolean,
  ): [unknown, TypeIssue[]] {
    if (diagnose && !Array.isArray(value)) {
      return [
        undefined,
        [
          {
            path,
            message: `Expecting value to be an array, getting ${toString.call(
              value,
            )}.`,
          },
        ],
      ];
    }

    let ElementType = this.ElementType;

    let unpacked: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let [index, valueElement] of (value as unknown[]).entries()) {
      let [unpackedElement, entryIssues] = ElementType._encode(
        medium,
        valueElement,
        [...path, index],
        diagnose,
      );

      unpacked.push(unpackedElement);
      issues.push(...entryIssues);
    }

    return [issues.length === 0 ? unpacked : undefined, issues];
  }

  /** @internal */
  _transform(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]] {
    // TODO: implicit conversion to array.

    if (!Array.isArray(unpacked)) {
      return [
        undefined,
        [
          {
            path,
            message: `Expecting unpacked value to be an array, getting ${toString.call(
              unpacked,
            )}.`,
          },
        ],
      ];
    }

    let ElementType = this.ElementType;

    let value: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let [index, unpackedElement] of unpacked.entries()) {
      let [element, entryIssues] = ElementType._transform(
        from,
        to,
        unpackedElement,
        [...path, index],
      );

      value.push(element);
      issues.push(...entryIssues);
    }

    return [issues.length === 0 ? value : undefined, issues];
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath): TypeIssue[] {
    if (!Array.isArray(value)) {
      return [
        {
          path,
          message: `Expecting an array, getting ${toString.call(value)}.`,
        },
      ];
    }

    let ElementType = this.ElementType;

    return value.flatMap((element, index) =>
      ElementType._diagnose(element, [...path, index]),
    );
  }
}

export function array<TElementType extends TypeInMediumsPartial>(
  ElementType: TElementType,
): ArrayType<TElementType> {
  return new ArrayType(ElementType);
}

type ArrayInMediums<TElementType extends TypeInMediumsPartial> = {
  [TKey in XValue.UsingName]: TElementType[__type_in_mediums][TKey][];
};
