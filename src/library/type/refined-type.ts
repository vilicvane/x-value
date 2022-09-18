import type {RefinedMediumType} from '../@internal';
import {buildIssueByError, hasNonDeferrableTypeIssue} from '../@internal';
import type {Medium} from '../medium';

import type {
  Exact,
  TypeInMediumsPartial,
  TypeIssue,
  TypePath,
  TypesInMediums,
  __type_in_mediums,
} from './type';
import {Type, __type_kind} from './type';

export class RefinedType<
  TType extends TypeInMediumsPartial,
  TNominalKey extends string | symbol,
  TRefinement,
> extends Type<RefinedInMediums<TType, TNominalKey, TRefinement>> {
  [__type_kind]!: 'refined';

  constructor(Type: TType, refinements: Refinement[]);
  constructor(readonly Type: Type, readonly refinements: Refinement[]) {
    super();
  }

  /** @internal */
  _decode(
    medium: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]] {
    let [value, issues] = this.Type._decode(medium, unpacked, path, exact);

    if (hasNonDeferrableTypeIssue(issues)) {
      return [undefined, issues];
    }

    let refinementIssues: TypeIssue[];

    [value, refinementIssues] = this.processRefinements(value, path);

    issues.push(...refinementIssues);

    return [
      hasNonDeferrableTypeIssue(refinementIssues) ? undefined : value,
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
    let [unpacked, issues] = this.Type._encode(
      medium,
      value,
      path,
      exact,
      diagnose,
    );

    if (hasNonDeferrableTypeIssue(issues)) {
      return [undefined, issues];
    }

    if (diagnose) {
      let [, refinementIssues] = this.processRefinements(value, path);

      issues.push(...refinementIssues);

      if (hasNonDeferrableTypeIssue(refinementIssues)) {
        return [undefined, issues];
      }
    }

    return [unpacked, issues];
  }

  /** @internal */
  _transform(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]] {
    let [value, issues] = this._decode(from, unpacked, path, exact);

    if (hasNonDeferrableTypeIssue(issues)) {
      return [undefined, issues];
    }

    let [transformedUnpacked] = this._encode(to, value, path, false, false);

    return [transformedUnpacked, issues];
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath, exact: Exact): TypeIssue[] {
    let issues = this.Type._diagnose(value, path, exact);

    if (hasNonDeferrableTypeIssue(issues)) {
      return issues;
    }

    let [, refinementIssues] = this.processRefinements(value, path);

    issues.push(...refinementIssues);

    return issues;
  }

  private processRefinements(
    value: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]] {
    let issues: TypeIssue[] = [];

    for (let refinement of this.refinements) {
      try {
        value = refinement(value);
      } catch (error) {
        issues.push(buildIssueByError(error, path));
      }
    }

    return [value, issues];
  }
}

export type Refinement<T = unknown> = (value: T) => T;

/**
 * DECLARATION ONLY.
 *
 * Exported to avoid TS4023 error:
 * https://github.com/Microsoft/TypeScript/issues/5711
 */
export declare const __nominal: unique symbol;

export type __nominal = typeof __nominal;

/**
 * DECLARATION ONLY.
 *
 * Exported to avoid TS4023 error:
 * https://github.com/Microsoft/TypeScript/issues/5711
 */
export declare const __type: unique symbol;

export type __type = typeof __type;

export type Nominal<TNominalKey extends string | symbol, T = unknown> = T &
  (unknown extends T ? unknown : Record<__type, T>) &
  Record<__nominal, {[TKey in TNominalKey]: true}>;

export type Denominalize<T> = T extends {[__type]: infer TDenominalized}
  ? TDenominalized
  : T;

export type DenominalizeDeep<T> = T extends {[__type]: infer TDenominalized}
  ? TDenominalized
  : {[TKey in keyof T]: DenominalizeDeep<T[TKey]>};

type RefinedInMediums<
  TType extends TypeInMediumsPartial,
  TNominalKey extends string | symbol,
  TRefinement,
> = __RefinedInMediums<TType[__type_in_mediums], TNominalKey, TRefinement>;

type __RefinedInMediums<
  TInMediums extends TypesInMediums,
  TNominalKey extends string | symbol,
  TRefinement,
> = {
  [TMediumName in XValue.UsingName]: RefinedMediumType<
    TInMediums[TMediumName],
    TNominalKey,
    TRefinement
  >;
};
