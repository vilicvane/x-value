import type {
  __ElementOrArray,
  __MediumTypeOf,
  __MediumTypesPackedType,
  __RefinedType,
} from '../@internal';
import {toString} from '../@internal';
import type {Medium} from '../medium';

import type {TypeConstraint, TypeIssue, TypeOf, TypePath} from './type';
import {Type} from './type';

export interface ArrayType<TElement> {
  refine<TNominalOrRefinement, TNominal = unknown>(
    constraints: __ElementOrArray<TypeConstraint<TypeOf<TElement>[]>>,
  ): __RefinedType<this, TNominalOrRefinement, TNominal>;

  decode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: __MediumTypesPackedType<
      TMediumTypes,
      __MediumTypeOf<TElement, TMediumTypes>[]
    >,
  ): TypeOf<TElement>[];

  encode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: TypeOf<TElement>[],
  ): __MediumTypesPackedType<
    TMediumTypes,
    __MediumTypeOf<TElement, TMediumTypes>[]
  >;

  transform<TFromMediumTypes extends object, TToMediumTypes extends object>(
    from: Medium<TFromMediumTypes>,
    to: Medium<TToMediumTypes>,
    value: __MediumTypesPackedType<
      TFromMediumTypes,
      __MediumTypeOf<TElement, TFromMediumTypes>[]
    >,
  ): __MediumTypesPackedType<
    TToMediumTypes,
    __MediumTypeOf<TElement, TToMediumTypes>[]
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

    let Element = this.Element;

    let unpacked: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let [index, valueElement] of (value as unknown[]).entries()) {
      let [unpackedElement, entryIssues] = Element._encode(
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
