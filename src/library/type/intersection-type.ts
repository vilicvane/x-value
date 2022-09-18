import type {TupleInMedium} from '../@internal';
import {hasNonDeferrableTypeIssue, merge} from '../@internal';
import type {Medium} from '../medium';

import type {Exact, TypeInMediumsPartial, TypeIssue, TypePath} from './type';
import {DISABLED_EXACT_CONTEXT_RESULT, Type, __type_kind} from './type';

export class IntersectionType<
  TTypeTuple extends [
    TypeInMediumsPartial,
    TypeInMediumsPartial,
    ...TypeInMediumsPartial[],
  ],
> extends Type<IntersectionInMediums<TTypeTuple>> {
  [__type_kind]!: 'intersection';

  constructor(TypeTuple: TTypeTuple);
  constructor(readonly TypeTuple: Type[]) {
    if (TypeTuple.length < 2) {
      throw new TypeError('Expecting at least 2 types for intersection type');
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
    const {managedContext, wrappedExact} = this.getExactContext(
      exact,
      'managed',
    );

    const partials: unknown[] = [];
    const issues: TypeIssue[] = [];

    for (const Type of this.TypeTuple) {
      const [partial, partialIssues] = Type._decode(
        medium,
        unpacked,
        path,
        wrappedExact,
      );

      partials.push(partial);
      issues.push(...partialIssues);
    }

    if (managedContext) {
      issues.push(...managedContext.getUnknownKeyIssues(unpacked, path));
    }

    return [
      hasNonDeferrableTypeIssue(issues) ? undefined : merge(partials),
      issues,
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
    const {managedContext, wrappedExact} = diagnose
      ? this.getExactContext(exact, 'managed')
      : DISABLED_EXACT_CONTEXT_RESULT;

    const partials: unknown[] = [];
    const issues: TypeIssue[] = [];

    for (const Type of this.TypeTuple) {
      const [partial, partialIssues] = Type._encode(
        medium,
        value,
        path,
        wrappedExact,
        diagnose,
      );

      partials.push(partial);
      issues.push(...partialIssues);
    }

    if (managedContext) {
      issues.push(...managedContext.getUnknownKeyIssues(value, path));
    }

    return [
      hasNonDeferrableTypeIssue(issues) ? undefined : merge(partials),
      issues,
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
    const {managedContext, wrappedExact} = this.getExactContext(
      exact,
      'managed',
    );

    const partials: unknown[] = [];
    const issues: TypeIssue[] = [];

    for (const Type of this.TypeTuple) {
      const [partial, partialIssues] = Type._transform(
        from,
        to,
        unpacked,
        path,
        wrappedExact,
      );

      partials.push(partial);
      issues.push(...partialIssues);
    }

    if (managedContext) {
      issues.push(...managedContext.getUnknownKeyIssues(unpacked, path));
    }

    return [
      hasNonDeferrableTypeIssue(issues) ? undefined : merge(partials),
      issues,
    ];
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath, exact: Exact): TypeIssue[] {
    const {managedContext, wrappedExact} = this.getExactContext(
      exact,
      'managed',
    );

    const issues = this.TypeTuple.flatMap(Type =>
      Type._diagnose(value, path, wrappedExact),
    );

    if (managedContext) {
      issues.push(...managedContext.getUnknownKeyIssues(value, path));
    }

    return issues;
  }
}

export function intersection<
  TTypeTuple extends [
    TypeInMediumsPartial,
    TypeInMediumsPartial,
    ...TypeInMediumsPartial[],
  ],
>(...Types: TTypeTuple): IntersectionType<TTypeTuple> {
  return new IntersectionType(Types);
}

export type IntersectionInMediums<TTypeTuple extends TypeInMediumsPartial[]> = {
  [TMediumName in XValue.UsingName]: __Intersection<
    TupleInMedium<TTypeTuple, TMediumName>
  >;
};

type __Intersection<TTuple extends unknown[]> = TTuple extends [
  infer T,
  ...infer TRestTuple,
]
  ? T & __Intersection<TRestTuple>
  : unknown;
