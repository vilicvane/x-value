import type {Exact} from './@exact-context';
import type {TypeIssue, TypePath} from './@type-issue';
import {hasNonDeferrableTypeIssue} from './@type-issue';
import type {TupleInMedium} from './@utils';
import type {Medium} from './medium';
import {DISABLED_EXACT_CONTEXT_RESULT, Type} from './type';
import {__type_kind} from './type-partials';
import type {TypeInMediumsPartial} from './type-partials';

const hasOwnProperty = Object.prototype.hasOwnProperty;

export class IntersectionType<
  TTypeTuple extends [
    TypeInMediumsPartial,
    TypeInMediumsPartial,
    ...TypeInMediumsPartial[],
  ],
> extends Type<IntersectionInMediums<TTypeTuple>> {
  [__type_kind]!: 'intersection';

  constructor(TypeTuple: TTypeTuple);
  constructor(private TypeTuple: Type[]) {
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
      hasNonDeferrableTypeIssue(issues)
        ? undefined
        : _mergeIntersectionPartials(partials),
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
      hasNonDeferrableTypeIssue(issues)
        ? undefined
        : _mergeIntersectionPartials(partials),
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
      hasNonDeferrableTypeIssue(issues)
        ? undefined
        : _mergeIntersectionPartials(partials),
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
>(Types: TTypeTuple): IntersectionType<TTypeTuple> {
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

export function _mergeIntersectionPartials(partials: unknown[]): unknown {
  let pendingMergeKeyToValues: Map<string | number, unknown[]> | undefined;

  const merged = partials.reduce((merged, partial) => {
    if (merged === partial) {
      return merged;
    }

    if (typeof merged === 'object') {
      if (merged === null || typeof partial !== 'object' || partial === null) {
        throw new TypeError(
          'Cannot merge object and non-object for intersection',
        );
      }

      for (const [key, value] of Object.entries(partial)) {
        let pendingMergeValues: unknown[] | undefined;

        if (pendingMergeKeyToValues) {
          pendingMergeValues = pendingMergeKeyToValues.get(key);
        } else {
          pendingMergeKeyToValues = new Map();
        }

        if (pendingMergeValues) {
          pendingMergeValues.push(value);
        } else if (hasOwnProperty.call(merged, key)) {
          pendingMergeKeyToValues.set(key, [(merged as any)[key], value]);
        } else {
          (merged as any)[key] = value;
        }
      }

      return merged;
    }

    return partial;
  });

  if (pendingMergeKeyToValues) {
    for (const [key, values] of pendingMergeKeyToValues) {
      (merged as any)[key] = _mergeIntersectionPartials(values);
    }
  }

  return merged;
}
