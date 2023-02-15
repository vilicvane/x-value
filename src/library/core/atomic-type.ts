import type {Exact} from './@exact-context';
import type {TypeIssue, TypePath} from './@type-issue';
import {buildIssueByError, hasNonDeferrableTypeIssue} from './@type-issue';
import type {JSONSchema} from './json-schema';
import type {Medium} from './medium';
import {Type} from './type';
import type {JSONSchemaData} from './type-like';
import {__type_kind} from './type-partials';

export class AtomicType<TSymbol extends symbol> extends Type<
  AtomicInMediums<TSymbol>
> {
  readonly [__type_kind] = 'atomic';

  constructor(
    symbol: TSymbol,
    constraints: AtomicTypeConstraint[],
    jsonSchema?: JSONSchema,
  );
  constructor(
    private symbol: symbol,
    private constraints: AtomicTypeConstraint[],
    private jsonSchema: JSONSchema | undefined,
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
      value = medium.getCodec(this.symbol).decode(unpacked);
    } catch (error) {
      return [undefined, [buildIssueByError(error, path)]];
    }

    const issues = this._diagnose(value, path, exact);

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
      return [medium.getCodec(this.symbol).encode(value), issues];
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
    const symbol = this.symbol;

    let value: unknown;

    try {
      value = from.getCodec(symbol).decode(unpacked);
    } catch (error) {
      return [undefined, [buildIssueByError(error, path)]];
    }

    const issues = this._diagnose(value, path, exact);

    if (hasNonDeferrableTypeIssue(issues)) {
      return [undefined, issues];
    }

    try {
      return [to.getCodec(symbol).encode(value), issues];
    } catch (error) {
      issues.push(buildIssueByError(error, path));

      return [undefined, issues];
    }
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath, _exact: Exact): TypeIssue[] {
    const issues: TypeIssue[] = [];

    for (const constraint of this.constraints) {
      try {
        constraint(value);
      } catch (error) {
        issues.push(buildIssueByError(error, path));
      }
    }

    return issues;
  }

  /** @internal */
  _toJSONSchema(): JSONSchemaData {
    const schema = this.jsonSchema;

    if (!schema) {
      throw new TypeError('JSON schema is not defined for this atomic type');
    }

    return {
      schema,
    };
  }
}

export function atomic<TSymbol extends symbol>(
  symbol: TSymbol,
  constraints: AtomicTypeConstraint | AtomicTypeConstraint[],
  jsonSchema?: JSONSchema,
): AtomicType<TSymbol> {
  return new AtomicType(
    symbol,
    Array.isArray(constraints) ? constraints : [constraints],
    jsonSchema,
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
