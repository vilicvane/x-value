import type {__MediumTypeOf} from '../@utils';
import type {Medium} from '../medium';

/* eslint-disable @mufan/import-groups */

export abstract class Type<TCategory extends string = string> {
  protected __static_type_category!: TCategory;

  refine(
    constraints: TypeConstraint | TypeConstraint[],
  ): RefinedType<Type, unknown> {
    return refined(this, constraints);
  }

  decode(medium: Medium, packed: unknown): unknown {
    let unpacked = medium.unpack(packed);
    let [value, issues] = this._decode(medium, unpacked, []);

    if (issues.length > 0) {
      throw new TypeConstraintError('Failed to decode from medium', issues);
    }

    return value;
  }

  encode(medium: Medium, value: unknown): unknown {
    let [unpacked, issues] = this._encode(medium, value, [], true);

    if (issues.length > 0) {
      throw new TypeConstraintError('Failed to encode to medium', issues);
    }

    return medium.pack(unpacked);
  }

  transform(from: Medium, to: Medium, packed: unknown): unknown {
    let unpacked = from.unpack(packed);
    let [transformedUnpacked, issues] = this._transform(from, to, unpacked, []);

    if (issues.length > 0) {
      throw new TypeConstraintError(`Failed to transform medium`, issues);
    }

    return to.pack(transformedUnpacked);
  }

  satisfies<T>(value: T): T {
    let issues = this.diagnose(value);

    if (issues.length === 0) {
      return value;
    }

    throw new TypeConstraintError('Value does not satisfy the type', issues);
  }

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

export type TypeConstraint<T = unknown> = (value: T) => string | boolean;

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

export type TypeOf<TType extends Type> = __MediumTypeOf<TType, XValue.Types>;

/* eslint-enable @mufan/import-groups */

// Make sure code in refined-type.ts accessing type.ts after exports ready.
import type {RefinedType} from './refined-type';
import {refined} from './refined-type';
