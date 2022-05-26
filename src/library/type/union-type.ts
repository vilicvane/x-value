import type {TupleInMedium} from '../@internal';
import type {Medium} from '../medium';

import type {TypeInMediumsPartial, TypeIssue, TypePath} from './type';
import {Type, __type_kind} from './type';

export class UnionType<
  TTypeTuple extends [
    TypeInMediumsPartial,
    TypeInMediumsPartial,
    ...TypeInMediumsPartial[],
  ],
> extends Type<UnionInMediums<TTypeTuple>> {
  [__type_kind]!: 'union';

  constructor(TypeTuple: TTypeTuple);
  constructor(readonly TypeTuple: Type[]) {
    if (TypeTuple.length < 2) {
      throw new TypeError('Expecting at least 2 type for union type');
    }

    super();
  }

  /** @internal */
  _decode(
    medium: Medium,
    unpacked: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]] {
    let maxIssuePathLength = -1;
    let outputIssues!: TypeIssue[];

    for (let Type of this.TypeTuple) {
      let [value, issues] = Type._decode(medium, unpacked, path);

      if (issues.length === 0) {
        return [value, issues];
      }

      let pathLength = Math.max(...issues.map(issue => issue.path.length));

      if (pathLength > maxIssuePathLength) {
        maxIssuePathLength = pathLength;
        outputIssues = issues;
      }
    }

    return [
      undefined,
      [
        {
          path,
          message:
            'The unpacked value satisfies none of the type in the union type.',
        },
        ...outputIssues,
      ],
    ];
  }

  /** @internal */
  _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
    diagnose: boolean,
  ): [unknown, TypeIssue[]] {
    let maxIssuePathLength = -1;
    let outputIssues!: TypeIssue[];

    for (let Type of this.TypeTuple) {
      let [unpacked, issues] = Type._encode(medium, value, path, diagnose);

      if (issues.length === 0) {
        return [unpacked, issues];
      }

      let pathLength = Math.max(...issues.map(issue => issue.path.length));

      if (pathLength > maxIssuePathLength) {
        maxIssuePathLength = pathLength;
        outputIssues = issues;
      }
    }

    // If diagnose is `false`, it will never reach here.

    return [
      undefined,
      [
        {
          path,
          message:
            'The unpacked value satisfies none of the type in the union type.',
        },
        ...outputIssues,
      ],
    ];
  }

  /** @internal */
  _transform(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]] {
    let maxIssuePathLength = -1;
    let outputIssues!: TypeIssue[];

    for (let Type of this.TypeTuple) {
      let [transformedUnpacked, issues] = Type._transform(
        from,
        to,
        unpacked,
        path,
      );

      if (issues.length === 0) {
        return [transformedUnpacked, issues];
      }

      let pathLength = Math.max(...issues.map(issue => issue.path.length));

      if (pathLength > maxIssuePathLength) {
        maxIssuePathLength = pathLength;
        outputIssues = issues;
      }
    }

    return [
      undefined,
      [
        {
          path,
          message:
            'The unpacked value satisfies none of the type in the union type.',
        },
        ...outputIssues,
      ],
    ];
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath): TypeIssue[] {
    let maxIssuePathLength = -1;
    let outputIssues!: TypeIssue[];

    for (let Type of this.TypeTuple) {
      let issues = Type._diagnose(value, path);

      if (issues.length === 0) {
        return issues;
      }

      let pathLength = Math.max(...issues.map(issue => issue.path.length));

      if (pathLength > maxIssuePathLength) {
        maxIssuePathLength = pathLength;
        outputIssues = issues;
      }
    }

    return outputIssues;
  }
}

export function union<
  TTypeTuple extends [
    TypeInMediumsPartial,
    TypeInMediumsPartial,
    ...TypeInMediumsPartial[],
  ],
>(...Types: TTypeTuple): UnionType<TTypeTuple> {
  return new UnionType(Types);
}

type UnionInMediums<TTypeTuple extends TypeInMediumsPartial[]> = {
  [TKey in XValue.UsingName]: TupleInMedium<TTypeTuple, TKey>[number];
};
