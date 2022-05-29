import type {TupleInMedium} from '../@internal';
import {toString} from '../@internal';
import type {Medium} from '../medium';

import type {Exact, TypeInMediumsPartial, TypeIssue, TypePath} from './type';
import {DISABLED_EXACT_CONTEXT_RESULT, Type, __type_kind} from './type';

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
            message: `Expecting unpacked value with ${ElementTypeTuple.length} instead of ${unpacked.length} element(s).`,
          },
        ],
      ];
    }

    let {context, nestedExact} = this.getExactContext(exact, false);

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

    context?.addKeys(
      Array.from(ElementTypeTuple.keys(), key => key.toString()),
    );

    return [issues.length === 0 ? value : undefined, issues];
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
            message: `Expecting value with ${
              ElementTypeTuple.length
            } instead of ${(value as unknown[]).length} element(s).`,
          },
        ],
      ];
    }

    let {context, nestedExact} = diagnose
      ? this.getExactContext(exact, false)
      : DISABLED_EXACT_CONTEXT_RESULT;

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

    context?.addKeys(
      Array.from(ElementTypeTuple.keys(), key => key.toString()),
    );

    return [issues.length === 0 ? unpacked : undefined, issues];
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
            message: `Expecting unpacked value with ${ElementTypeTuple.length} instead of ${unpacked.length} element(s).`,
          },
        ],
      ];
    }

    let {context, nestedExact} = this.getExactContext(exact, false);

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

    context?.addKeys(
      Array.from(ElementTypeTuple.keys(), key => key.toString()),
    );

    return [issues.length === 0 ? value : undefined, issues];
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath, exact: Exact): TypeIssue[] {
    if (!Array.isArray(value)) {
      return [
        {
          path,
          message: `Expecting an array, getting ${toString.call(value)}.`,
        },
      ];
    }

    let ElementTypeTuple = this.ElementTypeTuple;

    if ((value as unknown[]).length !== ElementTypeTuple.length) {
      return [
        {
          path,
          message: `Expecting value with ${ElementTypeTuple.length} instead of ${value.length} element(s).`,
        },
      ];
    }

    let {context, nestedExact} = this.getExactContext(exact, false);

    let issues = ElementTypeTuple.flatMap((Element, index) =>
      Element._diagnose(value[index], [...path, index], nestedExact),
    );

    context?.addKeys(
      Array.from(ElementTypeTuple.keys(), key => key.toString()),
    );

    return issues;
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
