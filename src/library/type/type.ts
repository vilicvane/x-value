/* eslint-disable @mufan/import-groups */

import type {ElementOrArray, MediumTypesPackedType} from '../@internal';
import {ExactContext} from '../@internal';
import type {Medium} from '../medium';

export type TypesInMediums = Record<XValue.UsingName, unknown>;

/**
 * DECLARATION ONLY.
 */
export declare const __type_in_mediums: unique symbol;

export type __type_in_mediums = typeof __type_in_mediums;

/**
 * DECLARATION ONLY.
 */
export declare const __type_kind: unique symbol;

export type __type_kind = typeof __type_kind;

export interface TypeInMediumsPartial<
  TInMediums extends TypesInMediums = TypesInMediums,
> {
  [__type_in_mediums]: TInMediums;
}

export interface TypeKindPartial<TKind extends string = string> {
  [__type_kind]: TKind;
}

export abstract class TypeLike<
  TInMediums extends TypesInMediums = TypesInMediums,
> {
  [__type_kind]!: string;

  [__type_in_mediums]!: TInMediums;

  /** @internal */
  abstract _decode(
    medium: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]];

  /** @internal */
  abstract _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
    exact: Exact,
    diagnose: boolean,
  ): [unknown, TypeIssue[]];

  /** @internal */
  abstract _transform(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]];

  /** @internal */
  abstract _diagnose(value: unknown, path: TypePath, exact: Exact): TypeIssue[];
}

export abstract class Type<
  TInMediums extends TypesInMediums = TypesInMediums,
> extends TypeLike<TInMediums> {
  readonly _exact: boolean | undefined;

  constructor() {
    super();
  }

  exact(exact = true): this {
    return Object.create(this, {
      _exact: {value: exact},
    });
  }

  refine<TNominalKey extends string | symbol = never, TRefinement = unknown>(
    constraints: ElementOrArray<TypeConstraint<TInMediums['value']>>,
  ): RefinedType<this, TNominalKey, TRefinement> {
    return new RefinedType(
      this,
      Array.isArray(constraints) ? constraints : [constraints],
    );
  }

  nominal<TNominalKey extends string | symbol>(): RefinedType<
    this,
    TNominalKey,
    unknown
  > {
    return new RefinedType(this, []);
  }

  optional(): OptionalType<this> {
    return new OptionalType(this);
  }

  decode<TMediumName extends XValue.UsingName, TMediumTypes extends object>(
    medium: Medium<TMediumName, TMediumTypes>,
    packed: MediumTypesPackedType<TMediumTypes, TInMediums[TMediumName]>,
  ): TInMediums['value'];
  decode(medium: Medium, packed: unknown): unknown {
    let unpacked = medium.unpack(packed);
    let [value, issues] = this._decode(
      medium,
      unpacked,
      [],
      this._exact ?? false,
    );

    if (issues.length > 0) {
      throw new TypeConstraintError('Failed to decode from medium', issues);
    }

    return value;
  }

  encode<TMediumName extends XValue.UsingName, TMediumTypes extends object>(
    medium: Medium<TMediumName, TMediumTypes>,
    value: TInMediums['value'],
  ): MediumTypesPackedType<TMediumTypes, TInMediums[TMediumName]>;
  encode(medium: Medium, value: unknown): unknown {
    let [unpacked, issues] = this._encode(
      medium,
      value,
      [],
      this._exact ?? false,
      true,
    );

    if (issues.length > 0) {
      throw new TypeConstraintError('Failed to encode to medium', issues);
    }

    return medium.pack(unpacked);
  }

  transform<
    TFromMediumName extends XValue.UsingName,
    TFromMediumTypes extends object,
    TToMediumName extends XValue.UsingName,
    TToMediumTypes extends object,
  >(
    from: Medium<TFromMediumName, TFromMediumTypes>,
    to: Medium<TToMediumName, TToMediumTypes>,
    value: MediumTypesPackedType<TFromMediumTypes, TInMediums[TFromMediumName]>,
  ): MediumTypesPackedType<TToMediumTypes, TInMediums[TToMediumName]>;
  transform(from: Medium, to: Medium, packed: unknown): unknown {
    let unpacked = from.unpack(packed);
    let [transformedUnpacked, issues] = this._transform(
      from,
      to,
      unpacked,
      [],
      this._exact ?? false,
    );

    if (issues.length > 0) {
      throw new TypeConstraintError(`Failed to transform medium`, issues);
    }

    return to.pack(transformedUnpacked);
  }

  satisfies(value: unknown): TInMediums['value'] {
    let issues = this.diagnose(value);

    if (issues.length === 0) {
      return value;
    }

    throw new TypeConstraintError('Value does not satisfy the type', issues);
  }

  is(value: unknown): value is TInMediums['value'] {
    return this.diagnose(value).length === 0;
  }

  diagnose(value: unknown): TypeIssue[] {
    return this._diagnose(value, [], this._exact ?? false);
  }

  protected getExactContext(
    exact: Exact,
    wrapper: 'managed',
  ): {
    /**
     * Undefined if not exact or inherited (not managed by the current type).
     */
    managedContext: ExactContext | undefined;
    wrappedExact: ExactContext | false;
    nestedExact: Exact;
  };
  protected getExactContext(
    exact: Exact,
    wrapper: 'transparent',
  ): {
    managedContext: undefined;
    wrappedExact: Exact;
    nestedExact: Exact;
  };
  protected getExactContext(
    exact: Exact,
    wrapper: false,
    neutralize?: boolean,
  ): {
    managedContext: undefined;
    wrappedExact: false;
    nestedExact: Exact;
  };
  protected getExactContext(
    exact: Exact,
    wrapper: 'managed' | 'transparent' | false,
    neutralize = false,
  ): {
    managedContext: ExactContext | undefined;
    wrappedExact: Exact;
    nestedExact: Exact;
  } {
    let selfExact = this._exact;

    if (selfExact === false) {
      if (typeof exact !== 'boolean') {
        if (!wrapper) {
          exact.touch();
        }

        exact.neutralize();
      }

      return {
        managedContext: undefined,
        wrappedExact: false,
        nestedExact: false,
      };
    }

    if (typeof exact === 'boolean') {
      if (exact || selfExact) {
        if (wrapper === 'managed') {
          let context = new ExactContext();

          return {
            managedContext: context,
            wrappedExact: context,
            nestedExact: true,
          };
        } else if (wrapper === 'transparent') {
          return {
            managedContext: undefined,
            wrappedExact: true,
            nestedExact: true,
          };
        } else {
          return {
            managedContext: undefined,
            wrappedExact: false,
            nestedExact: true,
          };
        }
      } else {
        return {
          managedContext: undefined,
          wrappedExact: false,
          nestedExact: false,
        };
      }
    } else {
      if (wrapper) {
        return {
          managedContext: undefined,
          wrappedExact: exact,
          nestedExact: true,
        };
      } else {
        exact.touch();

        if (neutralize) {
          exact.neutralize();
        }

        return {
          managedContext: undefined,
          wrappedExact: false,
          nestedExact: true,
        };
      }
    }
  }
}

export type TypePath = (
  | string
  | number
  | symbol
  | {key: string | number | symbol}
)[];

export interface TypeIssue {
  path: TypePath;
  fatal: boolean;
  message: string;
}

export type TypeConstraint<T = unknown> = (value: T) => string | boolean | void;

export class TypeConstraintError extends TypeError {
  constructor(private _message: string, readonly issues: TypeIssue[]) {
    super();
  }

  override get message(): string {
    return `\
${this._message}:
${this.issues
  .map(
    ({path, message}) =>
      `  ${
        path.length > 0
          ? `${path
              .map(
                segment =>
                  `[${
                    typeof segment === 'object'
                      ? `key:${JSON.stringify(segment.key)}`
                      : JSON.stringify(segment)
                  }]`,
              )
              .join('')} `
          : ''
      }${message}`,
  )
  .join('\n')}`;
  }
}

export type Exact = ExactContext | boolean;

export type TypeOf<TType extends TypeInMediumsPartial> =
  TType[__type_in_mediums]['value'];

// Make sure code circularly referenced accessing type.ts after exports ready.

import {OptionalType} from './optional-type';
import {RefinedType} from './refined-type';
