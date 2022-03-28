import {Medium, MediumPackedType} from './medium';
import {Value} from './value';

const hasOwnProperty = Object.prototype.hasOwnProperty;

export abstract class Type<TCategory extends string = string> {
  /**
   * For static type checking.
   */
  protected _category!: TCategory;

  decode<TCounterMedium extends Medium<object>>(
    medium: TCounterMedium,
    value: TCounterMedium extends Medium<infer TMediumTypes>
      ? MediumPackedType<TMediumTypes>
      : never,
  ): Value<this> {
    let unpacked = medium.unpack(value);

    return new Value(
      this,
      this.decodeUnpacked(medium, unpacked) as TypeToMediumType<
        this,
        Medium<XValue.Values>
      >,
    );
  }

  /** @internal */
  abstract decodeUnpacked(medium: Medium, unpacked: unknown): unknown;
}

export type PossibleType =
  | AtomicType<symbol>
  | ObjectType<object>
  | ArrayType<Type>
  | UnionType<Type>
  | IntersectionType<Type>
  | OptionalType<Type>;

export class AtomicType<TSymbol extends symbol> extends Type<'atomic'> {
  constructor(readonly symbol: TSymbol) {
    super();
  }

  /** @internal */
  decodeUnpacked(medium: Medium, unpacked: object): unknown {
    let codec = medium.requireCodec(this.symbol);
    return codec.decode(unpacked);
  }
}

export function atomic<TSymbol extends symbol>(
  symbol: TSymbol,
): AtomicType<TSymbol> {
  return new AtomicType(symbol);
}

export class ObjectType<TTypeDefinition extends object> extends Type<'object'> {
  constructor(readonly definition: TTypeDefinition) {
    super();
  }

  /** @internal */
  decodeUnpacked(medium: Medium, unpacked: unknown): unknown {
    // TODO: implicit conversion to object.

    if (typeof unpacked !== 'object' || unpacked === null) {
      throw new TypeError();
    }

    let entries = Object.entries(this.definition).map(
      ([key, Type]: [string, Type]) => [
        key,
        Type.decodeUnpacked(medium, (unpacked as any)[key]),
      ],
    );

    return Object.fromEntries(entries);
  }
}

export function object<TTypeDefinition extends object>(
  definition: TTypeDefinition,
): ObjectType<TTypeDefinition> {
  return new ObjectType(definition);
}

export class ArrayType<TElement extends Type> extends Type<'array'> {
  constructor(readonly Element: TElement) {
    super();
  }

  /** @internal */
  decodeUnpacked(medium: Medium, unpacked: unknown): unknown {
    // TODO: implicit conversion to array.

    if (!Array.isArray(unpacked)) {
      throw new TypeError();
    }

    let Element = this.Element;

    return unpacked.map(element => Element.decodeUnpacked(medium, element));
  }
}

export function array<TType extends Type>(type: TType): ArrayType<TType> {
  return new ArrayType(type);
}

export class UnionType<TType extends Type> extends Type<'union'> {
  constructor(readonly Types: TType[]) {
    if (Types.length === 0) {
      throw new TypeError();
    }

    super();
  }

  /** @internal */
  decodeUnpacked(medium: Medium, unpacked: unknown): unknown {
    let lastError!: unknown;

    for (let Type of this.Types) {
      try {
        return Type.decodeUnpacked(medium, unpacked);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  }
}

export function union<TTypes extends Type[]>(
  ...Types: TTypes
): UnionType<TTypes[number]> {
  return new UnionType(Types);
}

export class IntersectionType<TType extends Type> extends Type<'intersection'> {
  constructor(readonly Types: TType[]) {
    if (Types.length === 0) {
      throw new TypeError();
    }

    super();
  }

  /** @internal */
  decodeUnpacked(medium: Medium, unpacked: unknown): unknown {
    let partials = this.Types.map(Type =>
      Type.decodeUnpacked(medium, unpacked),
    );

    return merge(partials);

    function merge(partials: unknown[]): unknown {
      let pendingMergeKeyToValues: Map<string | number, unknown[]> | undefined;

      let merged = partials.reduce((merged, partial) => {
        if (merged === partial) {
          return merged;
        }

        if (typeof merged === 'object') {
          if (merged === null) {
            // merged !== partial
            throw new TypeError();
          }

          if (typeof partial !== 'object' || partial === null) {
            throw new TypeError();
          }

          for (let [key, value] of Object.entries(partial)) {
            let pendingMergeValues: unknown[] | undefined;

            if (pendingMergeKeyToValues) {
              pendingMergeValues = pendingMergeKeyToValues.get(key);
            } else {
              pendingMergeKeyToValues = new Map();
            }

            if (pendingMergeValues) {
              pendingMergeValues.push(value);
            } else if (hasOwnProperty.call(merged, key)) {
              pendingMergeKeyToValues.set(key, [(merged as any)[key], value]);
            } else {
              (merged as any)[key] = value;
            }
          }

          return merged;
        }
      });

      if (pendingMergeKeyToValues) {
        for (let [key, values] of pendingMergeKeyToValues) {
          (merged as any)[key] = merge(values);
        }
      }

      return merged;
    }
  }
}

export function intersection<TTypes extends Type[]>(
  ...Types: TTypes
): IntersectionType<TTypes[number]> {
  return new IntersectionType(Types);
}

export class OptionalType<TType extends Type> extends Type<'optional'> {
  constructor(readonly Type: TType) {
    super();
  }

  /** @internal */
  decodeUnpacked(medium: Medium, unpacked: unknown): unknown {
    if (unpacked === undefined) {
      return undefined;
    }

    return this.Type.decodeUnpacked(medium, unpacked);
  }
}

export function optional<TType extends Type>(Type: TType): OptionalType<TType> {
  return new OptionalType(Type);
}

export type TypeToMediumType<TType, TMedium> = TMedium extends Medium<
  infer TMediumTypes
>
  ? TMediumTypes extends {packed: infer T}
    ? T
    : __TypeToMediumType<TType, TMediumTypes>
  : never;

type __TypeToMediumType<TType, TMediumTypes> = TType extends ObjectType<
  infer TDefinition
>
  ? {
      [TKey in __KeyOfOptional<TDefinition>]?: TDefinition[TKey] extends OptionalType<
        infer TNestedType
      >
        ? __TypeToMediumType<TNestedType, TMediumTypes>
        : never;
    } & {
      [TKey in __KeyOfNonOptional<TDefinition>]: __TypeToMediumType<
        TDefinition[TKey],
        TMediumTypes
      >;
    }
  : TType extends ArrayType<infer TElementType>
  ? __TypeToMediumType<TElementType, TMediumTypes>[]
  : TType extends AtomicType<infer TTypeSymbol>
  ? TMediumTypes extends {[Symbol in TTypeSymbol]: infer TMediumType}
    ? TMediumType
    : never
  : TType extends UnionType<infer TElementType>
  ? __TypeToMediumType<TElementType, TMediumTypes>
  : TType extends IntersectionType<infer TElementType>
  ? __UnionToIntersection<__TypeToMediumType<TElementType, TMediumTypes>>
  : never;

type __KeyOfOptional<TType> = Extract<
  {
    [TKey in keyof TType]: TType[TKey] extends OptionalType<Type>
      ? TKey
      : never;
  }[keyof TType],
  string
>;

type __KeyOfNonOptional<TType> = Extract<
  {
    [TKey in keyof TType]: TType[TKey] extends OptionalType<Type>
      ? never
      : TKey;
  }[keyof TType],
  string
>;

type __UnionToIntersection<TUnion> = (
  TUnion extends unknown ? (_: TUnion) => unknown : never
) extends (_: infer TIntersection) => unknown
  ? TIntersection
  : never;
