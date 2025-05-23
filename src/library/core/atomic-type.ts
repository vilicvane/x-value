import type {Exact} from './@exact-context.js';
import {buildIssueByError, hasNonDeferrableTypeIssue} from './@type-issue.js';
import type {JSONSchema} from './json-schema.js';
import type {Medium} from './medium.js';
import type {JSONSchemaData} from './type-like.js';
import {__type_kind} from './type-partials.js';
import type {TypeIssue, TypePath} from './type.js';
import {Type} from './type.js';

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
  override _decode(
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
  override _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
    exact: Exact,
    diagnose: boolean,
  ): [unknown, TypeIssue[]] {
    let issues: TypeIssue[];

    /* istanbul ignore else */
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
  override _sanitize(value: unknown, path: TypePath): [unknown, TypeIssue[]] {
    const issues = this._diagnose(value, path, 'disabled');

    return [hasNonDeferrableTypeIssue(issues) ? undefined : value, issues];
  }

  /** @internal */
  override _diagnose(
    value: unknown,
    path: TypePath,
    _exact: Exact,
  ): TypeIssue[] {
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
