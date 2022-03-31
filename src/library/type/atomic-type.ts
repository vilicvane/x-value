import {__AtomicMediumType} from '../@utils';
import {Medium, MediumTypesPackedType} from '../medium';

import {Type, TypeConstraint, TypeIssue} from './type';

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

  convert<TFromMediumTypes extends object, TToMediumTypes extends object>(
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
  decodeUnpacked(medium: Medium, unpacked: unknown): [unknown, TypeIssue[]] {
    let value = medium.requireCodec(this.symbol).decode(unpacked);

    let issues = this.diagnose(value);

    return [issues.length === 0 ? value : undefined, issues];
  }

  /** @internal */
  encodeUnpacked(medium: Medium, value: unknown): [unknown, TypeIssue[]] {
    let issues = this.diagnose(value);

    if (issues.length > 0) {
      return [undefined, issues];
    }

    let unpacked = medium.requireCodec(this.symbol).encode(value);

    return [unpacked, issues];
  }

  /** @internal */
  convertUnpacked(
    from: Medium,
    to: Medium,
    unpacked: unknown,
  ): [unknown, TypeIssue[]] {
    let symbol = this.symbol;

    let value = from.requireCodec(symbol).decode(unpacked);

    let issues = this.diagnose(value);

    if (issues.length > 0) {
      return [undefined, issues];
    }

    let convertedUnpacked = to.requireCodec(symbol).encode(value);

    return [convertedUnpacked, issues];
  }

  diagnose(value: unknown): TypeIssue[] {
    let issues: TypeIssue[] = [];

    for (let constraint of this.constraints) {
      let result = constraint(value) ?? true;

      if (result === true) {
        continue;
      }

      issues.push({
        message: typeof result === 'string' ? result : 'Unexpected value',
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
