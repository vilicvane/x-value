import type {
  __ElementOrArray,
  __MediumTypeOf,
  __MediumTypesPackedType,
  __RefinedMediumType,
  __RefinedType,
} from '../@utils';
import type {Medium} from '../medium';

import type {TypeConstraint, TypeIssue, TypePath} from './type';
import {Type} from './type';

export interface RefinedType<TType, TRefinement, TNominal> {
  refine<TNominalOrRefinement, TNominal = unknown>(
    constraints: __ElementOrArray<
      TypeConstraint<
        __RefinedMediumType<TType, TNominalOrRefinement, TNominal, XValue.Types>
      >
    >,
  ): __RefinedType<this, TNominalOrRefinement, TNominal>;

  decode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: __MediumTypesPackedType<
      TMediumTypes,
      __RefinedMediumType<TType, TRefinement, TNominal, TMediumTypes>
    >,
  ): __RefinedMediumType<TType, TRefinement, TNominal, XValue.Types>;

  encode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: __RefinedMediumType<TType, TRefinement, TNominal, XValue.Types>,
  ): __MediumTypesPackedType<
    TMediumTypes,
    __RefinedMediumType<TType, TRefinement, TNominal, TMediumTypes>
  >;

  transform<TFromMediumTypes extends object, TToMediumTypes extends object>(
    from: Medium<TFromMediumTypes>,
    to: Medium<TToMediumTypes>,
    value: __MediumTypesPackedType<
      TFromMediumTypes,
      __RefinedMediumType<TType, TRefinement, TNominal, TFromMediumTypes>
    >,
  ): __MediumTypesPackedType<
    TToMediumTypes,
    __RefinedMediumType<TType, TRefinement, TNominal, TToMediumTypes>
  >;

  is(
    value: unknown,
  ): value is __RefinedMediumType<TType, TRefinement, TNominal, XValue.Types>;
}

export class RefinedType<
  TType extends Type,
  TRefinement,
  TNominal,
> extends Type<'refined'> {
  protected __static_type_refinement!: TRefinement;
  protected __static_type_nominal!: TNominal;

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

/**
 * DECLARATION ONLY.
 *
 * Exported to avoid TS4023 error:
 * https://github.com/Microsoft/TypeScript/issues/5711
 */
export declare const __nominalType: unique symbol;

export type Nominal<TNominal extends string | symbol, T = unknown> = T & {
  [TNominalTypeSymbol in typeof __nominalType]: T;
} & {
  [TNominalSymbol in typeof __nominal]: {
    [TNominalKey in TNominal]: true;
  };
};

export type Denominalize<T> = T extends {
  [TNominalTypeSymbol in typeof __nominalType]: infer TDenominalized;
}
  ? TDenominalized
  : T;
