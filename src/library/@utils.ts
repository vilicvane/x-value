import {
  ArrayType,
  AtomicType,
  IntersectionType,
  ObjectType,
  OptionalType,
  RecordType,
  TupleType,
  Type,
  TypeOf,
  UnionType,
} from './type';

export const hasOwnProperty = Object.prototype.hasOwnProperty;

export const toString = Object.prototype.toString;

export type __MediumTypeOf<
  TType,
  TMediumTypes,
  TAtomicSymbolOnly extends boolean,
> = TType extends ObjectType<infer TDefinition>
  ? __ObjectTypeDefinitionToMediumType<
      TDefinition,
      TMediumTypes,
      TAtomicSymbolOnly
    >
  : TType extends RecordType<infer TKey, infer TValue>
  ? Record<
      TypeOf<TKey>,
      __MediumTypeOf<TValue, TMediumTypes, TAtomicSymbolOnly>
    >
  : TType extends ArrayType<infer TElementType>
  ? __MediumTypeOf<TElementType, TMediumTypes, TAtomicSymbolOnly>[]
  : TType extends TupleType<infer TTuple>
  ? __TupleMediumType<TTuple, TMediumTypes, TAtomicSymbolOnly>
  : TType extends AtomicType<infer TAtomicType, infer TTypeSymbol>
  ? __AtomicMediumType<
      TAtomicSymbolOnly extends true ? unknown : TAtomicType,
      TTypeSymbol,
      TMediumTypes
    >
  : TType extends UnionType<infer TElementType>
  ? __MediumTypeOf<TElementType, TMediumTypes, TAtomicSymbolOnly>
  : TType extends IntersectionType<infer TElementType>
  ? __UnionToIntersection<
      __MediumTypeOf<TElementType, TMediumTypes, TAtomicSymbolOnly>
    >
  : never;

export type __ObjectTypeDefinitionToMediumType<
  TDefinition,
  TMediumTypes,
  TAtomicSymbolOnly extends boolean,
> = {
  [TKey in __KeyOfOptional<TDefinition>]?: TDefinition[TKey] extends OptionalType<
    infer TNestedType
  >
    ? __MediumTypeOf<TNestedType, TMediumTypes, TAtomicSymbolOnly>
    : never;
} & {
  [TKey in __KeyOfNonOptional<TDefinition>]: __MediumTypeOf<
    TDefinition[TKey],
    TMediumTypes,
    TAtomicSymbolOnly
  >;
};

export type __TupleMediumType<
  TElements,
  TMediumTypes,
  TAtomicSymbolOnly extends boolean,
> = {
  [TIndex in keyof TElements]: __MediumTypeOf<
    TElements[TIndex],
    TMediumTypes,
    TAtomicSymbolOnly
  >;
};

export type __AtomicMediumType<
  TType,
  TSymbol extends symbol,
  TMediumTypes,
> = unknown extends TType
  ? TMediumTypes extends {[TKey in TSymbol]: infer TMediumType}
    ? TMediumType
    : never
  : TType;

export type __KeyOfOptional<TType> = Extract<
  {
    [TKey in keyof TType]: TType[TKey] extends OptionalType<Type>
      ? TKey
      : never;
  }[keyof TType],
  string
>;

export type __KeyOfNonOptional<TType> = Extract<
  {
    [TKey in keyof TType]: TType[TKey] extends OptionalType<Type>
      ? never
      : TKey;
  }[keyof TType],
  string
>;

export type __UnionToIntersection<TUnion> = (
  TUnion extends unknown ? (_: TUnion) => unknown : never
) extends (_: infer TIntersection) => unknown
  ? TIntersection
  : never;

export function merge(partials: unknown[]): unknown {
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

    return partial;
  });

  if (pendingMergeKeyToValues) {
    for (let [key, values] of pendingMergeKeyToValues) {
      (merged as any)[key] = merge(values);
    }
  }

  return merged;
}
