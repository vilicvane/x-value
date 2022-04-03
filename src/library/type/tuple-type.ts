import {__MediumTypeOf, __TupleMediumType, toString} from '../@utils';
import {Medium, MediumTypesPackedType} from '../medium';

import {Type, TypeIssue, TypePath} from './type';

export interface TupleType<TElements> {
  decode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: MediumTypesPackedType<
      TMediumTypes,
      __TupleMediumType<TElements, TMediumTypes, true>
    >,
  ): __TupleMediumType<TElements, XValue.Types, false>;

  encode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: __TupleMediumType<TElements, XValue.Types, false>,
  ): MediumTypesPackedType<
    TMediumTypes,
    __TupleMediumType<TElements, TMediumTypes, true>
  >;

  transform<TFromMediumTypes extends object, TToMediumTypes extends object>(
    from: Medium<TFromMediumTypes>,
    to: Medium<TToMediumTypes>,
    value: MediumTypesPackedType<
      TFromMediumTypes,
      __TupleMediumType<TElements, TFromMediumTypes, true>
    >,
  ): MediumTypesPackedType<
    TToMediumTypes,
    __TupleMediumType<TElements, TToMediumTypes, true>
  >;

  is(
    value: unknown,
  ): value is __TupleMediumType<TElements, XValue.Types, false>;
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

    let Elements = this.Elements;

    let unpacked: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let [index, Element] of Elements.entries()) {
      let [unpackedElement, entryIssues] = Element._encode(
        medium,
        value[index],
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
