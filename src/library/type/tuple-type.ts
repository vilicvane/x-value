import type {TupleInMedium} from '../@internal';
import {hasFatalIssue, toString} from '../@internal';
import type {Medium} from '../medium';

import type {Exact, TypeInMediumsPartial, TypeIssue, TypePath} from './type';
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
    exact: Exact,
  ): [unknown, TypeIssue[]] {
    if (!Array.isArray(unpacked)) {
      return [
        undefined,
        [
          {
            path,
            fatal: true,
            message: `Expecting unpacked value to be an array, getting ${toString.call(
              unpacked,
            )}.`,
          },
        ],
      ];
    }

    let ElementTypeTuple = this.ElementTypeTuple;

    if (unpacked.length !== ElementTypeTuple.length) {
      return [
        undefined,
        [
          {
            path,
            fatal: true,
            message: `Expecting unpacked value with ${ElementTypeTuple.length} instead of ${unpacked.length} element(s).`,
          },
        ],
      ];
    }

    let {nestedExact} = this.getExactContext(exact, false);

    let value: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let [index, Element] of ElementTypeTuple.entries()) {
      let [element, entryIssues] = Element._decode(
        medium,
        unpacked[index],
        [...path, index],
        nestedExact,
      );

      value.push(element);
      issues.push(...entryIssues);
    }

    return [hasFatalIssue(issues) ? undefined : value, issues];
  }

  /** @internal */
  _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
    exact: Exact,
    diagnose: boolean,
  ): [unknown, TypeIssue[]] {
    if (diagnose && !Array.isArray(value)) {
      return [
        undefined,
        [
          {
            path,
            fatal: true,
            message: `Expecting value to be an array, getting ${toString.call(
              value,
            )}.`,
          },
        ],
      ];
    }

    let ElementTypeTuple = this.ElementTypeTuple;

    if ((value as unknown[]).length !== ElementTypeTuple.length) {
      return [
        undefined,
        [
          {
            path,
            fatal: true,
            message: `Expecting value with ${
              ElementTypeTuple.length
            } instead of ${(value as unknown[]).length} element(s).`,
          },
        ],
      ];
    }

    let {nestedExact} = diagnose
      ? this.getExactContext(exact, false)
      : {nestedExact: false};

    let unpacked: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let [index, Element] of ElementTypeTuple.entries()) {
      let [unpackedElement, entryIssues] = Element._encode(
        medium,
        (value as unknown[])[index],
        [...path, index],
        nestedExact,
        diagnose,
      );

      unpacked.push(unpackedElement);
      issues.push(...entryIssues);
    }

    return [hasFatalIssue(issues) ? undefined : unpacked, issues];
  }

  /** @internal */
  _transform(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]] {
    if (!Array.isArray(unpacked)) {
      return [
        undefined,
        [
          {
            path,
            fatal: true,
            message: `Expecting unpacked value to be an array, getting ${toString.call(
              unpacked,
            )}.`,
          },
        ],
      ];
    }

    let ElementTypeTuple = this.ElementTypeTuple;

    if (unpacked.length !== ElementTypeTuple.length) {
      return [
        undefined,
        [
          {
            path,
            fatal: true,
            message: `Expecting unpacked value with ${ElementTypeTuple.length} instead of ${unpacked.length} element(s).`,
          },
        ],
      ];
    }

    let {nestedExact} = this.getExactContext(exact, false);

    let value: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let [index, Element] of ElementTypeTuple.entries()) {
      let [element, entryIssues] = Element._transform(
        from,
        to,
        unpacked[index],
        [...path, index],
        nestedExact,
      );

      value.push(element);
      issues.push(...entryIssues);
    }

    return [hasFatalIssue(issues) ? undefined : value, issues];
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath, exact: Exact): TypeIssue[] {
    if (!Array.isArray(value)) {
      return [
        {
          path,
          fatal: true,
          message: `Expecting an array, getting ${toString.call(value)}.`,
        },
      ];
    }

    let ElementTypeTuple = this.ElementTypeTuple;

    if ((value as unknown[]).length !== ElementTypeTuple.length) {
      return [
        {
          path,
          fatal: true,
          message: `Expecting value with ${ElementTypeTuple.length} instead of ${value.length} element(s).`,
        },
      ];
    }

    let {nestedExact} = this.getExactContext(exact, false);

    return ElementTypeTuple.flatMap((Element, index) =>
      Element._diagnose(value[index], [...path, index], nestedExact),
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
