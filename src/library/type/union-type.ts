import {Medium, MediumPackedType} from '../medium';

import {Type, TypeIssue, TypeOf} from './type';

export class UnionType<TType extends Type> extends Type<'union'> {
  constructor(readonly Types: TType[]) {
    if (Types.length === 0) {
      throw new TypeError();
    }

    super();
  }

  decode<TCounterMedium extends Medium<object>>(
    medium: TCounterMedium,
    value: MediumPackedType<TCounterMedium>,
  ): TypeOf<TType>;
  decode(medium: Medium, value: unknown): unknown {
    return super.decode(medium, value);
  }

  encode<TCounterMedium extends Medium<object>>(
    medium: TCounterMedium,
    value: TypeOf<TType>,
  ): MediumPackedType<TCounterMedium>;
  encode(medium: Medium, value: unknown): unknown {
    return super.encode(medium, value);
  }

  /** @internal */
  decodeUnpacked(medium: Medium, unpacked: unknown): [unknown, TypeIssue[]] {
    let lastIssues!: TypeIssue[];

    for (let Type of this.Types) {
      let [value, issues] = Type.decodeUnpacked(medium, unpacked);

      if (issues.length === 0) {
        return [value, issues];
      }

      lastIssues = issues;
    }

    return [
      undefined,
      [
        {
          message:
            'The unpacked value satisfies none of the type in the union type',
        },
        ...lastIssues,
      ],
    ];
  }

  /** @internal */
  encodeUnpacked(medium: Medium, value: unknown): [unknown, TypeIssue[]] {
    let lastIssues!: TypeIssue[];

    for (let Type of this.Types) {
      let [unpacked, issues] = Type.encodeUnpacked(medium, value);

      if (issues.length === 0) {
        return [unpacked, issues];
      }

      lastIssues = issues;
    }

    return [
      undefined,
      [
        {
          message:
            'The unpacked value satisfies none of the type in the union type',
        },
        ...lastIssues,
      ],
    ];
  }

  diagnose(value: unknown): TypeIssue[] {
    let lastIssues!: TypeIssue[];

    for (let Type of this.Types) {
      let issues = Type.diagnose(value);

      lastIssues = issues;

      if (issues.length === 0) {
        return issues;
      }
    }

    return lastIssues;
  }
}

export function union<TTypes extends Type[]>(
  ...Types: TTypes
): UnionType<TTypes[number]> {
  return new UnionType(Types);
}
