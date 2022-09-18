import {buildIssueByError, hasNonDeferrableTypeIssue} from '../@internal';
import type {Medium} from '../medium';

import type {Exact, TypeIssue, TypePath} from './type';
import {Type, __type_kind} from './type';

export class AtomicType<TSymbol extends symbol> extends Type<
  AtomicInMediums<TSymbol>
> {
  [__type_kind]!: 'atomic';

  constructor(symbol: TSymbol, constraints: AtomicTypeConstraint[]);
  constructor(
    readonly symbol: symbol,
    readonly constraints: AtomicTypeConstraint[],
  ) {
    super();
  }

  /** @internal */
  _decode(
    medium: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]] {
    let value: unknown;

    try {
      value = medium.requireCodec(this.symbol).decode(unpacked);
    } catch (error) {
      return [undefined, [buildIssueByError(error, path)]];
    }

    let issues = this._diagnose(value, path, exact);

    return [hasNonDeferrableTypeIssue(issues) ? undefined : value, issues];
  }

  /** @internal */
  _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
    exact: Exact,
    diagnose: boolean,
  ): [unknown, TypeIssue[]] {
    let issues: TypeIssue[];

    if (diagnose) {
      issues = this._diagnose(value, path, exact);

      if (hasNonDeferrableTypeIssue(issues)) {
        return [undefined, issues];
      }
    } else {
      issues = [];
    }

    try {
      return [medium.requireCodec(this.symbol).encode(value), issues];
    } catch (error) {
      issues.push(buildIssueByError(error, path));

      return [undefined, issues];
    }
  }

  /** @internal */
  _transform(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]] {
    let symbol = this.symbol;

    let value: unknown;

    try {
      value = from.requireCodec(symbol).decode(unpacked);
    } catch (error) {
      return [undefined, [buildIssueByError(error, path)]];
    }

    let issues = this._diagnose(value, path, exact);

    if (hasNonDeferrableTypeIssue(issues)) {
      return [undefined, issues];
    }

    try {
      return [to.requireCodec(symbol).encode(value), issues];
    } catch (error) {
      issues.push(buildIssueByError(error, path));

      return [undefined, issues];
    }
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath, _exact: Exact): TypeIssue[] {
    let issues: TypeIssue[] = [];

    for (let constraint of this.constraints) {
      try {
        constraint(value);
      } catch (error) {
        issues.push(buildIssueByError(error, path));
      }
    }

    return issues;
  }
}

export function atomic<TSymbol extends symbol>(
  symbol: TSymbol,
  constraints: AtomicTypeConstraint | AtomicTypeConstraint[],
): AtomicType<TSymbol> {
  return new AtomicType(
    symbol,
    Array.isArray(constraints) ? constraints : [constraints],
  );
}

export type AtomicTypeConstraint = (value: unknown) => void;

type AtomicInMediums<TSymbol extends symbol> = {
  [TMediumName in XValue.UsingName]: AtomicInMedium<
    TSymbol,
    XValue.Using[TMediumName]
  >;
};

type AtomicInMedium<
  TSymbol extends symbol,
  TMediumTypes,
> = TSymbol extends keyof TMediumTypes ? TMediumTypes[TSymbol] : never;
