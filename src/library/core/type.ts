import type {Exact} from './@exact-context';
import {ExactContext} from './@exact-context';
import type {TypeIssue} from './@type-issue';
import type {Medium, MediumTypesPackedType} from './medium';
import {TypeLike} from './type-like';
import type {
  TypeInMediumsPartial,
  TypesInMediums,
  __type_in_mediums,
} from './type-partials';

export const DISABLED_EXACT_CONTEXT_RESULT = {
  context: undefined,
  managedContext: undefined,
  wrappedExact: false,
  nestedExact: false,
};

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

  decode<TMediumName extends XValue.UsingName, TMediumTypes extends object>(
    medium: Medium<TMediumName, TMediumTypes>,
    packed: MediumTypesPackedType<TMediumTypes, TInMediums[TMediumName]>,
  ): TInMediums['value'];
  decode(medium: Medium, packed: unknown): unknown {
    const unpacked = medium.unpack(packed);
    const [value, issues] = this._decode(
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
    const [unpacked, issues] = this._encode(
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
    const unpacked = from.unpack(packed);
    const [transformedUnpacked, issues] = this._transform(
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
    const issues = this.diagnose(value);

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
