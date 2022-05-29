import type {RefinedMediumType} from '../@internal';
import {buildIssueByError} from '../@internal';
import type {Medium} from '../medium';

import type {
  Exact,
  TypeConstraint,
  TypeInMediumsPartial,
  TypeIssue,
  TypePath,
  TypesInMediums,
  __type_in_mediums,
} from './type';
import {DISABLED_EXACT_CONTEXT_RESULT, Type, __type_kind} from './type';

export class RefinedType<
  TType extends TypeInMediumsPartial,
  TNominalKey extends string | symbol,
  TRefinement,
> extends Type<RefinedInMediums<TType, TNominalKey, TRefinement>> {
  [__type_kind]!: 'refined';

  constructor(Type: TType, constraints: TypeConstraint[]);
  constructor(readonly Type: Type, readonly constraints: TypeConstraint[]) {
    super();
  }

  nominalize(
    value: Denominalize<this[__type_in_mediums]['value']>,
  ): this[__type_in_mediums]['value'];
  nominalize(value: unknown): unknown {
    return value;
  }

  /** @internal */
  _decode(
    medium: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]] {
    let {managedContext, wrappedExact} = this.getExactContext(exact, 'managed');

    let [value, issues] = this.Type._decode(
      medium,
      unpacked,
      path,
      wrappedExact,
    );

    if (issues.length > 0) {
      return [undefined, issues];
    }

    issues = this.diagnoseConstraints(value, path);

    if (managedContext) {
      issues.push(...managedContext.getIssues(unpacked, path));
    }

    return [issues.length === 0 ? value : undefined, issues];
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

    let [unpacked, issues] = this.Type._encode(
      medium,
      value,
      path,
      wrappedExact,
      diagnose,
    );

    if (issues.length > 0) {
      return [undefined, issues];
    }

    if (diagnose) {
      issues = this.diagnoseConstraints(value, path);

      if (managedContext) {
        issues.push(...managedContext.getIssues(value, path));
      }

      if (issues.length > 0) {
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

    if (issues.length > 0) {
      return [undefined, issues];
    }

    return this._encode(to, value, path, false, false);
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath, exact: Exact): TypeIssue[] {
    let {managedContext, wrappedExact} = this.getExactContext(exact, 'managed');

    let issues = this.Type._diagnose(value, path, wrappedExact);

    if (issues.length > 0) {
      return issues;
    }

    issues = this.diagnoseConstraints(value, path);

    if (managedContext) {
      issues.push(...managedContext.getIssues(value, path));
    }

    return issues;
  }

  private diagnoseConstraints(value: unknown, path: TypePath): TypeIssue[] {
    let issues: TypeIssue[] = [];

    for (let constraint of this.constraints) {
      let result: boolean | string;

      try {
        result = constraint(value) ?? true;
      } catch (error) {
        issues.push(buildIssueByError(error, path));
        continue;
      }

      if (result === true) {
        continue;
      }

      issues.push({
        path,
        message: typeof result === 'string' ? result : 'Unexpected value.',
      });
    }

    return issues;
  }
}

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
