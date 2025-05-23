import type {Exact} from './@exact-context.js';
import {ExactContext} from './@exact-context.js';
import {hasNonDeferrableTypeIssue} from './@type-issue.js';
import type {TupleInMedium} from './@utils.js';
import type {
  JSONSchemaContext,
  JSONSchemaData,
  TraverseCallback,
} from './type-like.js';
import type {TypeInMediumsPartial} from './type-partials.js';
import {__type_kind} from './type-partials.js';
import type {TypeIssue, TypePath} from './type.js';
import {Type} from './type.js';

export class UnionType<
  TTypeTuple extends [
    TypeInMediumsPartial,
    TypeInMediumsPartial,
    ...TypeInMediumsPartial[],
  ],
> extends Type<UnionInMediums<TTypeTuple>> {
  readonly [__type_kind] = 'union';

  constructor(TypeTuple: TTypeTuple);
  constructor(private TypeTuple: Type[]) {
    if (TypeTuple.length < 2) {
      throw new TypeError('Expected at least 2 elements for union type');
    }

    super();
  }

  /** @internal */
  override _traverse(
    input: unknown,
    path: TypePath,
    exact: Exact,
    callback: TraverseCallback,
  ): [unknown, TypeIssue[]] {
    const {wrappedExact} = this.getExactContext(exact, 'transparent');

    let maxIssuePathLength = -1;
    let outputIssues!: TypeIssue[];

    for (const Type of this.TypeTuple) {
      const dedicatedExact =
        typeof wrappedExact === 'object' ? new ExactContext() : wrappedExact;

      const [value, issues] = callback(Type, input, path, dedicatedExact);

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
          message: 'Value satisfies none of the type in the union type.',
        },
        ...outputIssues,
      ],
    ];
  }

  /** @internal */
  _toJSONSchema(context: JSONSchemaContext, exact: boolean): JSONSchemaData {
    exact = this._exact ?? exact;

    const schemas = this.TypeTuple.map(
      Type => Type._toJSONSchema(context, exact).schema,
    );

    return {
      schema: context.define(this, exact, {
        anyOf: schemas,
      }),
    };
  }
}

export function union<
  TTypeTuple extends [
    TypeInMediumsPartial,
    TypeInMediumsPartial,
    ...TypeInMediumsPartial[],
  ],
>(Types: TTypeTuple): UnionType<TTypeTuple> {
  return new UnionType(Types);
}

type UnionInMediums<TTypeTuple extends TypeInMediumsPartial[]> = {
  [TMediumName in XValue.UsingName]: TupleInMedium<
    TTypeTuple,
    TMediumName
  >[number];
};

function syncDedicatedExact(wrappedExact: Exact, dedicatedExact: Exact): void {
  if (typeof wrappedExact === 'object' && typeof dedicatedExact === 'object') {
    if (dedicatedExact.touched) {
      wrappedExact.addKeys(dedicatedExact.keys);
    }

    if (dedicatedExact.neutralized) {
      wrappedExact.neutralize();
    }
  }
}
