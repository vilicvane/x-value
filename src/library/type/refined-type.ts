import type {RefinedMediumType} from '../@internal';
import {buildFatalIssueByError, hasFatalIssue} from '../@internal';
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
import {Type, __type_kind} from './type';

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
    let {wrappedExact} = this.getExactContext(exact, 'transparent');

    let [value, issues] = this.Type._decode(
      medium,
      unpacked,
      path,
      wrappedExact,
    );

    if (hasFatalIssue(issues)) {
      return [undefined, issues];
    }

    let diagnoseIssues = this.diagnoseConstraints(value, path);

    issues.push(...diagnoseIssues);

    return [hasFatalIssue(diagnoseIssues) ? undefined : value, issues];
  }

  /** @internal */
  _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
    exact: Exact,
    diagnose: boolean,
  ): [unknown, TypeIssue[]] {
    let {wrappedExact} = diagnose
      ? this.getExactContext(exact, 'transparent')
      : {wrappedExact: false};

    let [unpacked, issues] = this.Type._encode(
      medium,
      value,
      path,
      wrappedExact,
      diagnose,
    );

    if (hasFatalIssue(issues)) {
      return [undefined, issues];
    }

    if (diagnose) {
      let diagnoseIssues = this.diagnoseConstraints(value, path);

      issues.push(...diagnoseIssues);

      if (hasFatalIssue(diagnoseIssues)) {
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

    if (hasFatalIssue(issues)) {
      return [undefined, issues];
    }

    let [transformedUnpacked, transformIssues] = this._encode(
      to,
      value,
      path,
      false,
      false,
    );

    issues.push(...transformIssues);

    return [
      hasFatalIssue(transformIssues) ? undefined : transformedUnpacked,
      issues,
    ];
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath, exact: Exact): TypeIssue[] {
    let {wrappedExact} = this.getExactContext(exact, 'transparent');

    let issues = this.Type._diagnose(value, path, wrappedExact);

    if (hasFatalIssue(issues)) {
      return issues;
    }

    let diagnoseIssues = this.diagnoseConstraints(value, path);

    issues.push(...diagnoseIssues);

    return issues;
  }

  private diagnoseConstraints(value: unknown, path: TypePath): TypeIssue[] {
    let issues: TypeIssue[] = [];

    for (let constraint of this.constraints) {
      let result: boolean | string;

      try {
        result = constraint(value) ?? true;
      } catch (error) {
        issues.push(buildFatalIssueByError(error, path));
        continue;
      }

      if (result === true) {
        continue;
      }

      issues.push({
        path,
        fatal: true,
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
