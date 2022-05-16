import type {
  __ElementOrArray,
  __MediumTypesPackedType,
  __RefinedType,
  __TupleMediumType,
} from '../@internal';
import {__MediumTypeOf, toString} from '../@internal';
import type {Medium} from '../medium';

import type {TypeConstraint, TypeIssue, TypePath} from './type';
import {Type} from './type';

export interface TupleType<TElements> {
  refine<TNominalOrRefinement, TNominal = unknown>(
    constraints: __ElementOrArray<
      TypeConstraint<__TupleMediumType<TElements, XValue.Types>>
    >,
  ): __RefinedType<this, TNominalOrRefinement, TNominal>;

  decode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: __MediumTypesPackedType<
      TMediumTypes,
      __TupleMediumType<TElements, TMediumTypes>
    >,
  ): __TupleMediumType<TElements, XValue.Types>;

  encode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: __TupleMediumType<TElements, XValue.Types>,
  ): __MediumTypesPackedType<
    TMediumTypes,
    __TupleMediumType<TElements, TMediumTypes>
  >;

  transform<TFromMediumTypes extends object, TToMediumTypes extends object>(
    from: Medium<TFromMediumTypes>,
    to: Medium<TToMediumTypes>,
    value: __MediumTypesPackedType<
      TFromMediumTypes,
      __TupleMediumType<TElements, TFromMediumTypes>
    >,
  ): __MediumTypesPackedType<
    TToMediumTypes,
    __TupleMediumType<TElements, TToMediumTypes>
  >;

  is(value: unknown): value is __TupleMediumType<TElements, XValue.Types>;
}

export class TupleType<TElements extends Type[]> extends Type<'tuple'> {
  constructor(readonly Elements: TElements) {
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

    let Elements = this.Elements;

    let value: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let [index, Element] of Elements.entries()) {
      let [element, entryIssues] = Element._decode(medium, unpacked[index], [
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

    let Elements = this.Elements;

    let unpacked: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let [index, Element] of Elements.entries()) {
      let [unpackedElement, entryIssues] = Element._encode(
        medium,
        (value as unknown[])[index],
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

    let Elements = this.Elements;

    let value: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let [index, Element] of Elements.entries()) {
      let [element, entryIssues] = Element._transform(
        from,
        to,
        unpacked[index],
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

    return this.Elements.flatMap((Element, index) =>
      Element._diagnose(value[index], [...path, index]),
    );
  }
}

export function tuple<TElements extends Type[]>(
  ...Elements: TElements
): TupleType<TElements> {
  return new TupleType(Elements);
}
