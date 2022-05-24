import type {__RefinedMediumType} from '../@internal';
import type {Medium} from '../medium';

import type {TypeConstraint, TypeIssue, TypePath} from './type';
import {Type} from './type';

export class RefinedType<
  TType extends Type,
  TRefinement,
  TNominal,
> extends Type<__RefinedInMediums<TType, TRefinement, TNominal>> {
  protected __type!: 'refined';

  constructor(readonly Type: TType, readonly constraints: TypeConstraint[]) {
    super();
  }

  /** @internal */
  _decode(
    medium: Medium,
    unpacked: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]] {
    let [value, issues] = this.Type._decode(medium, unpacked, path);

    if (issues.length === 0) {
      issues = this.diagnoseConstraints(value, path);
    }

    return [issues.length === 0 ? value : undefined, issues];
  }

  /** @internal */
  _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
    diagnose: boolean,
  ): [unknown, TypeIssue[]] {
    if (diagnose) {
      let refineIssues = this.diagnoseConstraints(value, path);

      if (refineIssues.length > 0) {
        return [undefined, refineIssues];
      }
    }

    let [unpacked, issues] = this.Type._encode(medium, value, path, diagnose);

    return [issues.length === 0 ? unpacked : undefined, issues];
  }

  /** @internal */
  _transform(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]] {
    let [value, issues] = this._decode(from, unpacked, path);

    if (issues.length > 0) {
      return [undefined, issues];
    }

    return this._encode(to, value, path, false);
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath): TypeIssue[] {
    let issues = this.Type._diagnose(value, path);

    if (issues.length > 0) {
      return issues;
    }

    return this.diagnoseConstraints(value, path);
  }

  private diagnoseConstraints(value: unknown, path: TypePath): TypeIssue[] {
    let issues: TypeIssue[] = [];

    for (let constraint of this.constraints) {
      let result = constraint(value);

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
  Record<
    __nominal,
    {
      [TKey in TNominalKey]: true;
    }
  >;

export type Denominalize<T> = T extends Record<__type, infer TDenominalized>
  ? TDenominalized
  : T;

type __RefinedInMediums<
  TType extends Type,
  TRefinement,
  TNominal,
> = TType extends Type<infer TInMediums>
  ? {
      [TMediumName in keyof XValue.Using]: __RefinedMediumType<
        TInMediums[TMediumName],
        TRefinement,
        TNominal
      >;
    }
  : never;
