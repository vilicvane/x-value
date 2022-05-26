/* eslint-disable @mufan/import-groups */

import type {ElementOrArray, MediumTypesPackedType} from '../@internal';
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

export abstract class Type<TInMediums extends TypesInMediums = TypesInMediums> {
  [__type_kind]!: string;

  [__type_in_mediums]!: TInMediums;

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
    let [value, issues] = this._decode(medium, unpacked, []);

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
    let [unpacked, issues] = this._encode(medium, value, [], true);

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
    let [transformedUnpacked, issues] = this._transform(from, to, unpacked, []);

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

  is(value: unknown): value is TInMediums['value'];
  is(value: unknown): boolean {
    return this.diagnose(value).length === 0;
  }

  diagnose(value: unknown): TypeIssue[] {
    return this._diagnose(value, []);
  }

  /** @internal */
  abstract _decode(
    medium: Medium,
    unpacked: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]];

  /** @internal */
  abstract _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
    diagnose: boolean,
  ): [unknown, TypeIssue[]];

  /** @internal */
  abstract _transform(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]];

  /** @internal */
  abstract _diagnose(value: unknown, path: TypePath): TypeIssue[];
}

export type TypePath = (
  | string
  | number
  | symbol
  | {key: string | number | symbol}
)[];

export interface TypeIssue {
  path: TypePath;
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

export type TypeOf<TType extends TypeInMediumsPartial> =
  TType[__type_in_mediums]['value'];

// Make sure code circularly referenced accessing type.ts after exports ready.

import {OptionalType} from './optional-type';
import {RefinedType} from './refined-type';
