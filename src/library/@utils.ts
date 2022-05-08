import {
  ArrayType,
  AtomicType,
  IntersectionType,
  ObjectType,
  OptionalType,
  RecordType,
  RefinedType,
  TupleType,
  Type,
  UnionType,
} from './type';
import {Nominal} from './utils';

export const hasOwnProperty = Object.prototype.hasOwnProperty;

export const toString = Object.prototype.toString;

export type __MediumTypeOf<TType, TMediumTypes> = TType extends ObjectType<
  infer TDefinition
>
  ? __ObjectTypeDefinitionToMediumType<TDefinition, TMediumTypes>
  : TType extends RecordType<infer TKey, infer TValue>
  ? Record<
      __MediumTypeOfRecordKeyType<TKey, TMediumTypes>,
      __MediumTypeOf<TValue, TMediumTypes>
    >
  : TType extends ArrayType<infer TElementType>
  ? __MediumTypeOf<TElementType, TMediumTypes>[]
  : TType extends TupleType<infer TTuple>
  ? __TupleMediumType<TTuple, TMediumTypes>
  : TType extends RefinedType<infer TType, infer TNominal>
  ? __MediumTypeOf<TType, TMediumTypes> & TNominal
  : TType extends AtomicType<infer TTypeSymbol>
  ? __AtomicMediumType<TTypeSymbol, TMediumTypes>
  : TType extends UnionType<infer TTypeTuple>
  ? __MediumTypeOf<TTypeTuple[number], TMediumTypes>
  : TType extends IntersectionType<infer TTypeTuple>
  ? __UnionToIntersection<__MediumTypeOf<TTypeTuple[number], TMediumTypes>>
  : TType extends OptionalType<infer TType>
  ? __MediumTypeOf<TType, TMediumTypes> | undefined
  : never;

export type __ObjectTypeDefinitionToMediumType<TDefinition, TMediumTypes> = {
  [TKey in __KeyOfOptional<TDefinition>]?: TDefinition[TKey] extends OptionalType<
    infer TNestedType
  >
    ? __MediumTypeOf<TNestedType, TMediumTypes>
    : never;
} & {
  [TKey in __KeyOfNonOptional<TDefinition>]: __MediumTypeOf<
    TDefinition[TKey],
    TMediumTypes
  >;
};

export type __TypeOfRecordKeyType<TType> = __MediumTypeOfRecordKeyType<
  TType,
  XValue.Types
>;

export type __MediumTypeOfRecordKeyType<TType, TMediumTypes> = __MediumTypeOf<
  TType,
  TMediumTypes
> extends infer TKey
  ? Extract<TKey, string | symbol>
  : never;

export type __TupleMediumType<TElements, TMediumTypes> = {
  [TIndex in keyof TElements]: __MediumTypeOf<TElements[TIndex], TMediumTypes>;
};

export type __AtomicMediumType<
  TSymbol extends symbol,
  TMediumTypes,
> = TMediumTypes extends {[TKey in TSymbol]: infer TMediumType}
  ? TMediumType
  : never;

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

export type __MediumTypesPackedType<
  TMediumTypes,
  TFallback = never,
> = TMediumTypes extends {
  packed: infer TPacked;
}
  ? TPacked
  : TFallback;

export type __Nominal<TNominal> = TNominal extends string | symbol
  ? Nominal<TNominal>
  : TNominal;

export type __ElementOrArray<T> = T | T[];

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
