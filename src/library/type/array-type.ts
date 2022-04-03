import {__MediumTypeOf, toString} from '../@utils';
import {Medium, MediumTypesPackedType} from '../medium';

import {Type, TypeIssue, TypeOf, TypePath} from './type';

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

  transform<TFromMediumTypes extends object, TToMediumTypes extends object>(
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

    let Element = this.Element;

    let value: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let [index, unpackedElement] of unpacked.entries()) {
      let [element, entryIssues] = Element._decode(medium, unpackedElement, [
        ...path,
        index,
      ]);

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
  ): [unknown, TypeIssue[]] {
    if (!Array.isArray(value)) {
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

    let Element = this.Element;

    let unpacked: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let [index, valueElement] of value.entries()) {
      let [unpackedElement, entryIssues] = Element._encode(
        medium,
        valueElement,
        [...path, index],
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

    let Element = this.Element;

    let value: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let [index, unpackedElement] of unpacked.entries()) {
      let [element, entryIssues] = Element._transform(
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

    let Element = this.Element;

    return value.flatMap((element, index) =>
      Element._diagnose(element, [...path, index]),
    );
  }
}

export function array<TElement extends Type>(
  Element: TElement,
): ArrayType<TElement> {
  return new ArrayType(Element);
}
