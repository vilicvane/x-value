import {toString} from '../@internal';
import type {Medium} from '../medium';

import type {TypeIssue, TypePath} from './type';
import {Type} from './type';

export class ArrayType<TElementType extends Type> extends Type<
  __ArrayInMediums<TElementType>
> {
  protected __type!: 'array';

  constructor(readonly ElementType: TElementType) {
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

export function array<TElementType extends Type>(
  ElementType: TElementType,
): ArrayType<TElementType> {
  return new ArrayType(ElementType);
}

type __ArrayInMediums<TElementType extends Type> = TElementType extends Type<
  infer TElementInMediums
>
  ? {[TKey in keyof XValue.Using]: TElementInMediums[TKey][]}
  : never;
