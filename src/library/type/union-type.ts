import type {TupleInMedium} from '../@internal';
import {ExactContext} from '../@internal';
import type {Medium} from '../medium';

import type {Exact, TypeInMediumsPartial, TypeIssue, TypePath} from './type';
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
    exact: Exact,
  ): [unknown, TypeIssue[]] {
    let [exactContext, nestedExact, inherited] = this.getExactContext(
      exact,
      false,
    );

    let maxIssuePathLength = -1;
    let outputIssues!: TypeIssue[];

    for (let Type of this.TypeTuple) {
      let dedicatedExact = nestedExact ? new ExactContext() : false;

      let [value, issues] = Type._decode(
        medium,
        unpacked,
        path,
        dedicatedExact,
      );

      if (issues.length === 0) {
        issues.push(
          ...syncDedicatedExactAndGetIssues(
            exactContext,
            dedicatedExact,
            inherited,
            unpacked,
            path,
          ),
        );

        return [issues.length > 0 ? undefined : value, issues];
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
    exact: Exact,
    diagnose: boolean,
  ): [unknown, TypeIssue[]] {
    let [exactContext, nestedExact, inherited] = diagnose
      ? this.getExactContext(exact, false)
      : [undefined, false, false];

    let maxIssuePathLength = -1;
    let outputIssues!: TypeIssue[];

    for (let Type of this.TypeTuple) {
      let dedicatedExact = nestedExact ? new ExactContext() : false;

      let [unpacked, issues] = Type._encode(
        medium,
        value,
        path,
        dedicatedExact,
        diagnose,
      );

      if (issues.length === 0) {
        issues.push(
          ...syncDedicatedExactAndGetIssues(
            exactContext,
            dedicatedExact,
            inherited,
            value,
            path,
          ),
        );

        return [issues.length > 0 ? undefined : unpacked, issues];
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
    exact: Exact,
  ): [unknown, TypeIssue[]] {
    let [exactContext, nestedExact, inherited] = this.getExactContext(
      exact,
      false,
    );

    let maxIssuePathLength = -1;
    let outputIssues!: TypeIssue[];

    for (let Type of this.TypeTuple) {
      let dedicatedExact = nestedExact ? new ExactContext() : false;

      let [transformedUnpacked, issues] = Type._transform(
        from,
        to,
        unpacked,
        path,
        dedicatedExact,
      );

      if (issues.length === 0) {
        issues.push(
          ...syncDedicatedExactAndGetIssues(
            exactContext,
            dedicatedExact,
            inherited,
            unpacked,
            path,
          ),
        );

        return [issues.length > 0 ? undefined : transformedUnpacked, issues];
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
  _diagnose(value: unknown, path: TypePath, exact: Exact): TypeIssue[] {
    let [exactContext, nestedExact, inherited] = this.getExactContext(
      exact,
      false,
    );

    let maxIssuePathLength = -1;
    let outputIssues!: TypeIssue[];

    for (let Type of this.TypeTuple) {
      let dedicatedExact = nestedExact ? new ExactContext() : false;

      let issues = Type._diagnose(value, path, dedicatedExact);

      if (issues.length === 0) {
        issues.push(
          ...syncDedicatedExactAndGetIssues(
            exactContext,
            dedicatedExact,
            inherited,
            value,
            path,
          ),
        );

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

function syncDedicatedExactAndGetIssues(
  exactContext: ExactContext | undefined,
  dedicatedExact: ExactContext | false,
  inherited: boolean,
  object: unknown,
  path: TypePath,
): TypeIssue[] {
  if (exactContext && dedicatedExact && dedicatedExact.activated) {
    if (dedicatedExact.activated) {
      exactContext.addKeys(dedicatedExact.keys);
    }

    if (dedicatedExact.neutralized) {
      exactContext.neutralize();
    }

    return inherited ? [] : exactContext.getIssues(object, path);
  }

  return [];
}
