import {__AtomicMediumType} from '../@utils';
import {Medium, MediumTypesPackedType} from '../medium';

import {Type, TypeConstraint, TypeIssue, TypePath} from './type';

export type AtomicTypeType<
  TType,
  TSymbol extends symbol,
> = unknown extends TType
  ? XValue.Types extends {[TKey in TSymbol]: infer T}
    ? T
    : never
  : TType;

export interface AtomicType<TType, TSymbol> {
  decode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: MediumTypesPackedType<
      TMediumTypes,
      __AtomicMediumType<unknown, TSymbol, TMediumTypes>
    >,
  ): __AtomicMediumType<TType, TSymbol, XValue.Types>;

  encode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: __AtomicMediumType<TType, TSymbol, XValue.Types>,
  ): MediumTypesPackedType<
    TMediumTypes,
    __AtomicMediumType<unknown, TSymbol, TMediumTypes>
  >;

  transform<TFromMediumTypes extends object, TToMediumTypes extends object>(
    from: Medium<TFromMediumTypes>,
    to: Medium<TToMediumTypes>,
    value: MediumTypesPackedType<
      TFromMediumTypes,
      __AtomicMediumType<unknown, TSymbol, TFromMediumTypes>
    >,
  ): MediumTypesPackedType<
    TToMediumTypes,
    __AtomicMediumType<unknown, TSymbol, TToMediumTypes>
  >;

  is(value: unknown): value is __AtomicMediumType<TType, TSymbol, XValue.Types>;
}

export class AtomicType<
  TType,
  TSymbol extends symbol = never,
> extends Type<'atomic'> {
  protected __static_type_type!: TType;

  constructor(readonly symbol: symbol, readonly constraints: TypeConstraint[]) {
    super();
  }

  refine<TRefinedType extends AtomicTypeType<TType, TSymbol>>(
    constraint: TypeConstraint<AtomicTypeType<TType, TSymbol>>,
  ): AtomicType<TRefinedType, TSymbol> {
    return new AtomicType(this.symbol, [...this.constraints, constraint]);
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
  ): [unknown, TypeIssue[]] {
    let issues = this._diagnose(value, path);

    if (issues.length > 0) {
      return [undefined, issues];
    }

    let unpacked = medium.requireCodec(this.symbol).encode(value);

    return [unpacked, issues];
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
  constraint: TypeConstraint,
): AtomicType<unknown, TSymbol> {
  return new AtomicType(symbol, [constraint]);
}
