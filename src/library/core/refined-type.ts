import type {Exact} from './@exact-context.js';
import {buildIssueByError, hasNonDeferrableTypeIssue} from './@type-issue.js';
import type {JSONSchema} from './json-schema.js';
import type {Medium} from './medium.js';
import type {JSONSchemaContext, JSONSchemaData} from './type-like.js';
import type {
  TypeInMediums,
  TypeInMediumsPartial,
  __type_in_mediums,
} from './type-partials.js';
import {__type_kind} from './type-partials.js';
import type {TypeIssue, TypePath} from './type.js';
import {Type} from './type.js';

export class RefinedType<
  TType extends TypeInMediumsPartial,
  TNominalKey extends string | symbol,
  TRefinement,
  TGeneral extends boolean = false,
> extends Type<RefinedInMediums<TType, TNominalKey, TRefinement>, TGeneral> {
  readonly [__type_kind] = 'refined';

  constructor(Type: TType, refinements: Refinement[], jsonSchema?: JSONSchema);
  constructor(
    private Type: Type,
    private refinements: Refinement[],
    private jsonSchema?: JSONSchema,
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
    let [value, issues] = this.Type._decode(medium, unpacked, path, exact);

    if (hasNonDeferrableTypeIssue(issues)) {
      return [undefined, issues];
    }

    let refinementIssues: TypeIssue[];

    [value, refinementIssues] = this.processRefinements(value, path);

    issues.push(...refinementIssues);

    return [
      hasNonDeferrableTypeIssue(refinementIssues) ? undefined : value,
      issues,
    ];
  }

  /** @internal */
  override _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
    exact: Exact,
    diagnose: boolean,
  ): [unknown, TypeIssue[]] {
    const [unpacked, issues] = this.Type._encode(
      medium,
      value,
      path,
      exact,
      diagnose,
    );

    if (hasNonDeferrableTypeIssue(issues)) {
      return [undefined, issues];
    }

    // istanbul ignore else
    if (diagnose) {
      const [refinedValue, refinementIssues] = this.processRefinements(
        value,
        path,
      );

      issues.push(...refinementIssues);

      if (refinedValue !== value) {
        issues.push({
          path,
          message: 'Expected encoding value to be stable after refinements.',
        });
      }

      if (hasNonDeferrableTypeIssue(refinementIssues)) {
        return [undefined, issues];
      }
    }

    return [unpacked, issues];
  }

  /** @internal */
  override _sanitize(value: unknown, path: TypePath): [unknown, TypeIssue[]] {
    const [sanitized, issues] = this.Type._sanitize(value, path);

    if (hasNonDeferrableTypeIssue(issues)) {
      return [undefined, issues];
    }

    const [refined, refinementIssues] = this.processRefinements(
      sanitized,
      path,
    );

    issues.push(...refinementIssues);

    if (hasNonDeferrableTypeIssue(refinementIssues)) {
      return [undefined, issues];
    }

    return [refined, issues];
  }

  /** @internal */
  override _diagnose(
    value: unknown,
    path: TypePath,
    exact: Exact,
  ): TypeIssue[] {
    const issues = this.Type._diagnose(value, path, exact);

    if (hasNonDeferrableTypeIssue(issues)) {
      return issues;
    }

    const [, refinementIssues] = this.processRefinements(value, path);

    issues.push(...refinementIssues);

    return issues;
  }

  /** @internal */
  _toJSONSchema(context: JSONSchemaContext, exact: boolean): JSONSchemaData {
    const data = this.Type._toJSONSchema(context, this._exact ?? exact);

    const schemaOverrides = this.jsonSchema;

    if (!schemaOverrides) {
      return data;
    }

    const {schema} = data;

    return {
      schema: schema.$ref
        ? context.define(this, exact, {
            allOf: [schema],
            ...schemaOverrides,
          })
        : {
            ...schema,
            ...schemaOverrides,
          },
    };
  }

  private processRefinements(
    value: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]] {
    const issues: TypeIssue[] = [];

    for (const refinement of this.refinements) {
      try {
        value = refinement(value);
      } catch (error) {
        issues.push(buildIssueByError(error, path));
      }
    }

    return [value, issues];
  }
}

declare module './type.js' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Type<TInMediums, TGeneral> {
    refined<TNominalKey extends string | symbol = never, TRefinement = unknown>(
      refinements: ElementOrArray<Refinement<TInMediums['value'], TGeneral>>,
      jsonSchema?: JSONSchema,
    ): RefinedType<this, TNominalKey, TRefinement, TGeneral>;

    nominal<TNominalKey extends string | symbol = never>(
      jsonSchema?: JSONSchema,
    ): RefinedType<this, TNominalKey, unknown, TGeneral>;

    nominalize(
      value: DenominalizeDeep<TInMediums['value']>,
    ): TInMediums['value'];
  }
}

Type.prototype.refined = function (refinements, jsonSchema) {
  return new RefinedType(
    this,
    Array.isArray(refinements) ? refinements : [refinements],
    jsonSchema,
  );
};

Type.prototype.nominal = function (jsonSchema) {
  return new RefinedType(this, [], jsonSchema);
};

Type.prototype.nominalize = function (value) {
  return this.satisfies(value);
};

export type Refinement<
  T = unknown,
  TGeneral extends boolean = false,
> = TGeneral extends true ? (value: unknown) => never : (value: T) => T;

export const __nominal = Symbol('nominal');

export type __nominal = typeof __nominal;

export const __type = Symbol('type');

export type __type = typeof __type;

export type Nominal<TNominalKey extends string | symbol, T = unknown> = T &
  (unknown extends T ? unknown : Record<__type, T>) &
  Record<__nominal, {[TKey in TNominalKey]: true}>;

export type Denominalize<T> = T extends {[__type]: infer TDenominalized}
  ? TDenominalized
  : T;

export type DenominalizeDeep<T> = T extends {[__type]: infer TDenominalized}
  ? TDenominalized
  : {[TKey in keyof T]: DenominalizeDeep<T[TKey]>};

type RefinedInMediums<
  TType extends TypeInMediumsPartial,
  TNominalKey extends string | symbol,
  TRefinement,
> = __RefinedInMediums<TType[__type_in_mediums], TNominalKey, TRefinement>;

type __RefinedInMediums<
  TInMediums extends TypeInMediums,
  TNominalKey extends string | symbol,
  TRefinement,
> = {
  [TMediumName in XValue.UsingName]: RefinedMediumType<
    TInMediums[TMediumName],
    TNominalKey,
    TRefinement
  >;
};

type RefinedMediumType<
  TInMedium,
  TNominalKey extends string | symbol,
  TRefinement,
> = [TNominalKey] extends [never]
  ? TInMedium & TRefinement
  : __RefinedNominalType<TInMedium & TRefinement, Nominal<TNominalKey>>;

type __RefinedNominalType<T, TNominal extends NominalPartial> = T &
  (TNominal & Record<__type, Denominalize<T>>);

export type NominalPartial = Record<__nominal, unknown>;

type ElementOrArray<T> = T | T[];
