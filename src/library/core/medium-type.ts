import type {Exact} from './@exact-context';
import {ExactContext} from './@exact-context';
import {TypeConstraintError} from './errors';
import type {Medium, MediumPackedType} from './medium';
import {TypeLike} from './type-like';
import type {TypesInMediums, __type_in_mediums} from './type-partials';

export const DISABLED_EXACT_CONTEXT_RESULT = {
  context: undefined,
  managedContext: undefined,
  wrappedExact: false,
  nestedExact: false,
};

export abstract class MediumType<
  TInMediums extends TypesInMediums = TypesInMediums,
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

  encode<TMedium extends Medium<object>>(
    medium: TMedium,
    value: TInMediums['value'],
  ): MediumPackedType<TMedium, TInMediums>;
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
    TFromMedium extends Medium<object>,
    TToMedium extends Medium<object>,
  >(
    from: TFromMedium,
    to: TToMedium,
    value: MediumPackedType<TFromMedium, TInMediums>,
  ): MediumPackedType<TToMedium, TInMediums>;
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
