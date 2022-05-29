import type {TupleInMedium} from '../@internal';
import {merge} from '../@internal';
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
    let {managedContext, wrappedExact} = this.getExactContext(exact, 'managed');

    let partials: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let Type of this.TypeTuple) {
      let [partial, partialIssues] = Type._decode(
        medium,
        unpacked,
        path,
        wrappedExact,
      );

      partials.push(partial);
      issues.push(...partialIssues);
    }

    if (managedContext) {
      issues.push(...managedContext.getIssues(unpacked, path));
    }

    return [issues.length === 0 ? merge(partials) : undefined, issues];
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

    let partials: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let Type of this.TypeTuple) {
      let [partial, partialIssues] = Type._encode(
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
      issues.push(...managedContext.getIssues(value, path));
    }

    return [issues.length === 0 ? merge(partials) : undefined, issues];
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

    let partials: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let Type of this.TypeTuple) {
      let [partial, partialIssues] = Type._transform(
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
      issues.push(...managedContext.getIssues(unpacked, path));
    }

    return [issues.length === 0 ? merge(partials) : undefined, issues];
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath, exact: Exact): TypeIssue[] {
    let {managedContext, wrappedExact} = this.getExactContext(exact, 'managed');

    let issues = this.TypeTuple.flatMap(Type =>
      Type._diagnose(value, path, wrappedExact),
    );

    if (managedContext) {
      issues.push(...managedContext.getIssues(value, path));
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
