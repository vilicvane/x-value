import {__MediumTypeOf} from '../@utils';
import {Medium} from '../medium';

export abstract class Type<TCategory extends string = string> {
  protected __static_type_category!: TCategory;

  decode(medium: Medium, packed: unknown): unknown {
    let unpacked = medium.unpack(packed);
    let [value, issues] = this._decode(medium, unpacked, []);

    if (issues.length > 0) {
      throw new TypeConstraintError('Failed to decode from medium', issues);
    }

    return value;
  }

  encode(medium: Medium, value: unknown): unknown {
    let [unpacked, issues] = this._encode(medium, value, []);

    if (issues.length > 0) {
      throw new TypeConstraintError('Failed to encode to medium', issues);
    }

    return medium.pack(unpacked);
  }

  convert(from: Medium, to: Medium, packed: unknown): unknown {
    let unpacked = from.unpack(packed);
    let [convertedUnpacked, issues] = this._convert(from, to, unpacked, []);

    if (issues.length > 0) {
      throw new TypeConstraintError(`Failed to convert medium`, issues);
    }

    return to.pack(convertedUnpacked);
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
  ): [unknown, TypeIssue[]];

  /** @internal */
  abstract _convert(
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

  get message(): string {
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

export type TypeOf<TType extends Type> = __MediumTypeOf<
  TType,
  XValue.Types,
  false
>;
