import type {
  __AtomicMediumType,
  __ElementOrArray,
  __MediumTypesPackedType,
  __RefinedType,
} from '../@utils';
import type {Medium} from '../medium';

import type {TypeConstraint, TypeIssue, TypePath} from './type';
import {Type} from './type';

export interface AtomicType<TSymbol> {
  refine<TNominalOrRefinement, TNominal = unknown>(
    constraints: __ElementOrArray<
      TypeConstraint<__AtomicMediumType<TSymbol, XValue.Types>>
    >,
  ): __RefinedType<this, TNominalOrRefinement, TNominal>;

  decode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: __MediumTypesPackedType<
      TMediumTypes,
      __AtomicMediumType<TSymbol, TMediumTypes>
    >,
  ): __AtomicMediumType<TSymbol, XValue.Types>;

  encode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: __AtomicMediumType<TSymbol, XValue.Types>,
  ): __MediumTypesPackedType<
    TMediumTypes,
    __AtomicMediumType<TSymbol, TMediumTypes>
  >;

  transform<TFromMediumTypes extends object, TToMediumTypes extends object>(
    from: Medium<TFromMediumTypes>,
    to: Medium<TToMediumTypes>,
    value: __MediumTypesPackedType<
      TFromMediumTypes,
      __AtomicMediumType<TSymbol, TFromMediumTypes>
    >,
  ): __MediumTypesPackedType<
    TToMediumTypes,
    __AtomicMediumType<TSymbol, TToMediumTypes>
  >;

  is(value: unknown): value is __AtomicMediumType<TSymbol, XValue.Types>;
}

export class AtomicType<TSymbol extends symbol> extends Type<'atomic'> {
  constructor(symbol: TSymbol, constraints: TypeConstraint[]);
  constructor(readonly symbol: symbol, readonly constraints: TypeConstraint[]) {
    super();
  }

  /** @internal */
  _decode(
    medium: Medium,
    unpacked: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]] {
    let value = medium.requireCodec(this.symbol).decode(unpacked);

    let issues = this._diagnose(value, path);

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
      let issues = this._diagnose(value, path);

      if (issues.length > 0) {
        return [undefined, issues];
      }
    }

    let unpacked = medium.requireCodec(this.symbol).encode(value);

    return [unpacked, []];
  }

  /** @internal */
  _transform(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]] {
    let symbol = this.symbol;

    let value = from.requireCodec(symbol).decode(unpacked);

    let issues = this._diagnose(value, path);

    if (issues.length > 0) {
      return [undefined, issues];
    }

    let transformedUnpacked = to.requireCodec(symbol).encode(value);

    return [transformedUnpacked, issues];
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath): TypeIssue[] {
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

export function atomic<TSymbol extends symbol>(
  symbol: TSymbol,
  constraints: TypeConstraint | TypeConstraint[],
): AtomicType<TSymbol> {
  return new AtomicType(
    symbol,
    Array.isArray(constraints) ? constraints : [constraints],
  );
}
