import type {Exact} from './@exact-context';
import {ExactContext} from './@exact-context';
import type {TypeIssue} from './@type-issue';
import type {JSONSchema} from './json-schema';
import type {Medium, MediumPackedType} from './medium';
import {JSONSchemaContext, TypeLike} from './type-like';
import type {
  TypeInMediums,
  TypeInMediumsPartial,
  __type_in_mediums,
} from './type-partials';

export const DISABLED_EXACT_CONTEXT_RESULT = {
  context: undefined,
  managedContext: undefined,
  wrappedExact: false,
  nestedExact: false,
};

export abstract class Type<
  TInMediums extends TypeInMediums = TypeInMediums,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TGeneral extends boolean = false,
> extends TypeLike<TInMediums> {
  readonly _exact: boolean | undefined;

  exact(exact = true): this {
    return Object.create(this, {
      _exact: {value: exact},
    });
  }

  decode<TMedium extends Medium<object>>(
    medium: TMedium,
    packed: MediumPackedType<TMedium, TInMediums>,
  ): TInMediums['value'];
  decode(medium: Medium, packed: unknown): unknown {
    const unpacked = medium.unpack(packed);

    const [value, issues] = this._traverse(
      unpacked,
      [],
      this._exact ?? false,
      (Type, value, path, exact) => Type._decode(medium, value, path, exact),
    );

    if (issues.length > 0) {
      throw new TypeConstraintError('Failed to decode from medium', issues);
    }

    return value;
  }

  encode<TMedium extends Medium<object>>(
    medium: TMedium,
    value: TInMediums['value'],
  ): MediumPackedType<TMedium, TInMediums>;
  encode(medium: Medium, value: unknown): unknown {
    const [unpacked, issues] = this._traverse(
      value,
      [],
      this._exact ?? false,
      (Type, value, path, exact) =>
        Type._encode(medium, value, path, exact, true),
    );

    if (issues.length > 0) {
      throw new TypeConstraintError('Failed to encode to medium', issues);
    }

    return medium.pack(unpacked);
  }

  transform<
    TFromMedium extends Medium<object>,
    TToMedium extends Medium<object>,
  >(
    from: TFromMedium,
    to: TToMedium,
    value: MediumPackedType<TFromMedium, TInMediums>,
  ): MediumPackedType<TToMedium, TInMediums>;
  transform(from: Medium, to: Medium, packed: unknown): unknown {
    const unpacked = from.unpack(packed);

    const [transformedUnpacked, issues] = this._traverse(
      unpacked,
      [],
      this._exact ?? false,
      (Type, value, path, exact) => {
        const [decoded, issues] = Type._decode(from, value, path, exact);

        if (issues.length > 0) {
          return [undefined, issues];
        }

        return Type._encode(to, decoded, path, exact, false);
      },
    );

    if (issues.length > 0) {
      throw new TypeConstraintError(`Failed to transform medium`, issues);
    }

    return to.pack(transformedUnpacked);
  }

  diagnose(value: unknown): TypeIssue[] {
    const [, issues] = this._traverse(
      value,
      [],
      this._exact ?? false,
      (Type, value, path, exact) => [
        undefined,
        Type._diagnose(value, path, exact),
      ],
    );

    return issues;
  }

  satisfies(value: unknown): TInMediums['value'] {
    const issues = this.diagnose(value);

    if (issues.length > 0) {
      throw new TypeConstraintError('Value does not satisfy the type', issues);
    }

    return value;
  }

  asserts(value: unknown): void {
    this.satisfies(value);
  }

  is(value: unknown): value is TInMediums['value'] {
    return this.diagnose(value).length === 0;
  }

  toJSONSchema(): JSONSchema {
    const context = new JSONSchemaContext();

    return {
      ...this._toJSONSchema(context, this._exact ?? false).schema,
      $defs: context.definitions,
    };
  }

  protected getExactContext(
    exact: Exact,
    wrapper: 'managed',
  ): {
    context: ExactContext | undefined;
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
    context: ExactContext | undefined;
    managedContext: undefined;
    wrappedExact: Exact;
    nestedExact: Exact;
  };
  protected getExactContext(
    exact: Exact,
    wrapper: false,
  ): {
    context: ExactContext | undefined;
    managedContext: undefined;
    wrappedExact: false;
    nestedExact: Exact;
  };
  protected getExactContext(
    exact: Exact,
    wrapper: 'managed' | 'transparent' | false,
  ): {
    context: ExactContext | undefined;
    managedContext: ExactContext | undefined;
    wrappedExact: Exact;
    nestedExact: Exact;
  } {
    const context = typeof exact === 'boolean' ? undefined : exact;

    const selfExact = this._exact;

    if (selfExact === false) {
      if (context) {
        context.neutralize();
      }

      return DISABLED_EXACT_CONTEXT_RESULT;
    }

    if (context) {
      if (wrapper) {
        return {
          context,
          managedContext: undefined,
          wrappedExact: exact,
          nestedExact: true,
        };
      } else {
        return {
          context,
          managedContext: undefined,
          wrappedExact: false,
          nestedExact: true,
        };
      }
    } else {
      if ((exact as boolean) || selfExact) {
        if (wrapper === 'managed') {
          const context = new ExactContext();

          return {
            context,
            managedContext: context,
            wrappedExact: context,
            nestedExact: true,
          };
        } else if (wrapper === 'transparent') {
          return {
            context,
            managedContext: undefined,
            wrappedExact: true,
            nestedExact: true,
          };
        } else {
          return {
            context,
            managedContext: undefined,
            wrappedExact: false,
            nestedExact: true,
          };
        }
      } else {
        return {
          context,
          managedContext: undefined,
          wrappedExact: false,
          nestedExact: false,
        };
      }
    }
  }
}

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
                      ? 'key' in segment
                        ? `key:${JSON.stringify(segment.key)}`
                        : `args[${segment.argument}]`
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
