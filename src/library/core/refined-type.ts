import type {Exact} from './@exact-context';
import type {TypeIssue, TypePath} from './@type-issue';
import {buildIssueByError, hasNonDeferrableTypeIssue} from './@type-issue';
import type {Medium} from './medium';
import {Type} from './type';
import type {JSONSchemaContext, JSONSchemaData} from './type-like';
import type {
  TypeInMediumsPartial,
  TypesInMediums,
  __type_in_mediums,
} from './type-partials';
import {__type_kind} from './type-partials';

export class RefinedType<
  TType extends TypeInMediumsPartial,
  TNominalKey extends string | symbol,
  TRefinement,
> extends Type<RefinedInMediums<TType, TNominalKey, TRefinement>> {
  readonly [__type_kind] = 'refined';

  constructor(Type: TType, refinements: Refinement[]);
  constructor(private Type: Type, private refinements: Refinement[]) {
    super();
  }

  /** @internal */
  _decode(
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
  _encode(
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

    if (diagnose) {
      const [refinedValue, refinementIssues] = this.processRefinements(
        value,
        path,
      );

      issues.push(...refinementIssues);

      if (refinedValue !== value) {
        issues.push({
          path,
          message: 'Expecting encoding value to be stable after refinements.',
        });
      }

      if (hasNonDeferrableTypeIssue(refinementIssues)) {
        return [undefined, issues];
      }
    }

    return [unpacked, issues];
  }

  /** @internal */
  _transform(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]] {
    const [value, issues] = this._decode(from, unpacked, path, exact);

    if (hasNonDeferrableTypeIssue(issues)) {
      return [undefined, issues];
    }

    const [transformedUnpacked] = this._encode(to, value, path, false, false);

    return [transformedUnpacked, issues];
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath, exact: Exact): TypeIssue[] {
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
    return this.Type._toJSONSchema(context, this._exact ?? exact);
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

declare module './type' {
  interface Type<TInMediums> {
    refined<TNominalKey extends string | symbol = never, TRefinement = unknown>(
      refinements: ElementOrArray<Refinement<TInMediums['value']>>,
    ): RefinedType<this, TNominalKey, TRefinement>;

    nominal<TNominalKey extends string | symbol>(): RefinedType<
      this,
      TNominalKey,
      unknown
    >;

    nominalize(
      value: DenominalizeDeep<TInMediums['value']>,
    ): TInMediums['value'];
  }
}

Type.prototype.refined = function (refinements) {
  return new RefinedType(
    this,
    Array.isArray(refinements) ? refinements : [refinements],
  );
};

Type.prototype.nominal = function () {
  return new RefinedType(this, []);
};

Type.prototype.nominalize = function (value) {
  return this.satisfies(value);
};

export type Refinement<T = unknown> = (value: T) => T;

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
  TInMediums extends TypesInMediums,
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
