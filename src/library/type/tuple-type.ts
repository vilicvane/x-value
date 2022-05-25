import type {TupleInMedium} from '../@internal';
import {toString} from '../@internal';
import type {Medium} from '../medium';

import type {TypeInMediumsPartial, TypeIssue, TypePath} from './type';
import {Type, __type_kind} from './type';

export class TupleType<
  TElementTypeTuple extends TypeInMediumsPartial[],
> extends Type<TupleInMediums<TElementTypeTuple>> {
  [__type_kind]!: 'tuple';

  constructor(ElementTypeTuple: TElementTypeTuple);
  constructor(readonly ElementTypeTuple: Type[]) {
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

    let ElementTypeTuple = this.ElementTypeTuple;

    let value: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let [index, Element] of ElementTypeTuple.entries()) {
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

    let ElementTypeTuple = this.ElementTypeTuple;

    let unpacked: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let [index, Element] of ElementTypeTuple.entries()) {
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

    let ElementTypeTuple = this.ElementTypeTuple;

    let value: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let [index, Element] of ElementTypeTuple.entries()) {
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

    return this.ElementTypeTuple.flatMap((Element, index) =>
      Element._diagnose(value[index], [...path, index]),
    );
  }
}

export function tuple<TElementTypeTuple extends TypeInMediumsPartial[]>(
  ...ElementTypeTuple: TElementTypeTuple
): TupleType<TElementTypeTuple> {
  return new TupleType(ElementTypeTuple);
}

type TupleInMediums<TElementTypeTuple extends TypeInMediumsPartial[]> = {
  [TMediumName in XValue.UsingName]: TupleInMedium<
    TElementTypeTuple,
    TMediumName
  >;
};
