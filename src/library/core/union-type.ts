import type {Exact} from './@exact-context';
import {ExactContext} from './@exact-context';
import type {TypeIssue, TypePath} from './@type-issue';
import {hasNonDeferrableTypeIssue} from './@type-issue';
import type {TupleInMedium} from './@utils';
import type {Medium} from './medium';
import {DISABLED_EXACT_CONTEXT_RESULT, Type} from './type';
import {__type_kind} from './type-partials';
import type {TypeInMediumsPartial} from './type-partials';

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
    const {wrappedExact} = this.getExactContext(exact, 'transparent');

    let maxIssuePathLength = -1;
    let outputIssues!: TypeIssue[];

    for (const Type of this.TypeTuple) {
      const dedicatedExact =
        typeof wrappedExact === 'boolean' ? wrappedExact : new ExactContext();

      const [value, issues] = Type._decode(
        medium,
        unpacked,
        path,
        dedicatedExact,
      );

      if (hasNonDeferrableTypeIssue(issues)) {
        const pathLength = Math.max(...issues.map(issue => issue.path.length));

        if (pathLength > maxIssuePathLength) {
          maxIssuePathLength = pathLength;
          outputIssues = issues;
        }

        continue;
      }

      syncDedicatedExact(wrappedExact, dedicatedExact);

      return [value, issues];
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
    const {wrappedExact} = diagnose
      ? this.getExactContext(exact, 'transparent')
      : DISABLED_EXACT_CONTEXT_RESULT;

    let maxIssuePathLength = -1;
    let outputIssues!: TypeIssue[];

    for (const Type of this.TypeTuple) {
      const dedicatedExact =
        typeof wrappedExact === 'boolean' ? wrappedExact : new ExactContext();

      const [unpacked, issues] = Type._encode(
        medium,
        value,
        path,
        dedicatedExact,
        diagnose,
      );

      if (hasNonDeferrableTypeIssue(issues)) {
        const pathLength = Math.max(...issues.map(issue => issue.path.length));

        if (pathLength > maxIssuePathLength) {
          maxIssuePathLength = pathLength;
          outputIssues = issues;
        }

        continue;
      }

      syncDedicatedExact(wrappedExact, dedicatedExact);

      return [unpacked, issues];
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
    const {wrappedExact} = this.getExactContext(exact, 'transparent');

    let maxIssuePathLength = -1;
    let outputIssues!: TypeIssue[];

    for (const Type of this.TypeTuple) {
      const dedicatedExact =
        typeof wrappedExact === 'boolean' ? wrappedExact : new ExactContext();

      const [transformedUnpacked, issues] = Type._transform(
        from,
        to,
        unpacked,
        path,
        dedicatedExact,
      );

      if (hasNonDeferrableTypeIssue(issues)) {
        const pathLength = Math.max(...issues.map(issue => issue.path.length));

        if (pathLength > maxIssuePathLength) {
          maxIssuePathLength = pathLength;
          outputIssues = issues;
        }

        continue;
      }

      syncDedicatedExact(wrappedExact, dedicatedExact);

      return [transformedUnpacked, issues];
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
    const {wrappedExact} = this.getExactContext(exact, 'transparent');

    let maxIssuePathLength = -1;
    let outputIssues!: TypeIssue[];

    for (const Type of this.TypeTuple) {
      const dedicatedExact =
        typeof wrappedExact === 'boolean' ? wrappedExact : new ExactContext();

      const issues = Type._diagnose(value, path, dedicatedExact);

      if (hasNonDeferrableTypeIssue(issues)) {
        const pathLength = Math.max(...issues.map(issue => issue.path.length));

        if (pathLength > maxIssuePathLength) {
          maxIssuePathLength = pathLength;
          outputIssues = issues;
        }

        continue;
      }

      syncDedicatedExact(wrappedExact, dedicatedExact);

      return issues;
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
