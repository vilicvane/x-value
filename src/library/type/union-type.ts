import type {TupleInMedium} from '../@internal';
import {ExactContext} from '../@internal';
import type {Medium} from '../medium';

import type {Exact, TypeInMediumsPartial, TypeIssue, TypePath} from './type';
import {DISABLED_EXACT_CONTEXT_RESULT, Type, __type_kind} from './type';

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
    let {managedContext, wrappedExact} = this.getExactContext(exact, 'managed');

    let maxIssuePathLength = -1;
    let outputIssues!: TypeIssue[];

    for (let Type of this.TypeTuple) {
      let dedicatedExact =
        typeof wrappedExact === 'boolean' ? wrappedExact : new ExactContext();

      let [value, issues] = Type._decode(
        medium,
        unpacked,
        path,
        dedicatedExact,
      );

      if (issues.length === 0) {
        syncDedicatedExact(wrappedExact, dedicatedExact);

        if (managedContext) {
          issues.push(...managedContext.getIssues(unpacked, path));
        }

        return [issues.length === 0 ? value : undefined, issues];
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
    let {managedContext, wrappedExact} = diagnose
      ? this.getExactContext(exact, 'managed')
      : DISABLED_EXACT_CONTEXT_RESULT;

    let maxIssuePathLength = -1;
    let outputIssues!: TypeIssue[];

    for (let Type of this.TypeTuple) {
      let dedicatedExact =
        typeof wrappedExact === 'boolean' ? wrappedExact : new ExactContext();

      let [unpacked, issues] = Type._encode(
        medium,
        value,
        path,
        dedicatedExact,
        diagnose,
      );

      if (issues.length === 0) {
        syncDedicatedExact(wrappedExact, dedicatedExact);

        if (managedContext) {
          issues.push(...managedContext.getIssues(value, path));
        }

        return [issues.length === 0 ? unpacked : undefined, issues];
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
          message: 'The value satisfies none of the type in the union type.',
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
    let {managedContext, wrappedExact} = this.getExactContext(exact, 'managed');

    let maxIssuePathLength = -1;
    let outputIssues!: TypeIssue[];

    for (let Type of this.TypeTuple) {
      let dedicatedExact =
        typeof wrappedExact === 'boolean' ? wrappedExact : new ExactContext();

      let [transformedUnpacked, issues] = Type._transform(
        from,
        to,
        unpacked,
        path,
        dedicatedExact,
      );

      if (issues.length === 0) {
        syncDedicatedExact(wrappedExact, dedicatedExact);

        if (managedContext) {
          issues.push(...managedContext.getIssues(unpacked, path));
        }

        return [issues.length === 0 ? transformedUnpacked : undefined, issues];
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
    let {managedContext, wrappedExact} = this.getExactContext(exact, 'managed');

    let maxIssuePathLength = -1;
    let outputIssues!: TypeIssue[];

    for (let Type of this.TypeTuple) {
      let dedicatedExact =
        typeof wrappedExact === 'boolean' ? wrappedExact : new ExactContext();

      let issues = Type._diagnose(value, path, dedicatedExact);

      if (issues.length === 0) {
        syncDedicatedExact(wrappedExact, dedicatedExact);

        if (managedContext) {
          issues.push(...managedContext.getIssues(value, path));
        }

        return issues;
      }

      let pathLength = Math.max(...issues.map(issue => issue.path.length));

      if (pathLength > maxIssuePathLength) {
        maxIssuePathLength = pathLength;
        outputIssues = issues;
      }
    }

    return [
      {
        path,
        message: 'The value satisfies none of the type in the union type.',
      },
      ...outputIssues,
    ];
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

function syncDedicatedExact(wrappedExact: Exact, dedicatedExact: Exact): void {
  if (
    typeof wrappedExact !== 'boolean' &&
    typeof dedicatedExact !== 'boolean'
  ) {
    if (dedicatedExact.touched) {
      wrappedExact.addKeys(dedicatedExact.keys);
    }

    if (dedicatedExact.neutralized) {
      wrappedExact.neutralize();
    }
  }
}
