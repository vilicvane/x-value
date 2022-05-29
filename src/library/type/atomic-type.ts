import {buildIssueByError} from '../@internal';
import type {Medium} from '../medium';

import type {Exact, TypeConstraint, TypeIssue, TypePath} from './type';
import {Type, __type_kind} from './type';

export class AtomicType<TSymbol extends symbol> extends Type<
  AtomicInMediums<TSymbol>
> {
  [__type_kind]!: 'atomic';

  constructor(symbol: TSymbol, constraints: TypeConstraint[]);
  constructor(readonly symbol: symbol, readonly constraints: TypeConstraint[]) {
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
    let issues: TypeIssue[];

    if (diagnose) {
      issues = this._diagnose(value, path, exact);

      if (issues.length > 0) {
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

    if (issues.length > 0) {
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
