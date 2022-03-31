import {ArrayType} from './array-type';
import {AtomicType} from './atomic-type';
import {IntersectionType} from './intersection-type';
import {ObjectType} from './object-type';
import {OptionalType} from './optional-type';
import {Type} from './type';
import {UnionType} from './union-type';

const hasOwnProperty = Object.prototype.hasOwnProperty;

export type __MediumTypeOf<TType, TMediumTypes> = TType extends ObjectType<
  infer TDefinition
>
  ? __ObjectTypeDefinitionToMediumType<TDefinition, TMediumTypes>
  : TType extends ArrayType<infer TElementType>
  ? __MediumTypeOf<TElementType, TMediumTypes>[]
  : TType extends AtomicType<infer TAtomicType, infer TTypeSymbol>
  ? unknown extends TAtomicType
    ? TMediumTypes extends {[TKey in TTypeSymbol]: infer TMediumType}
      ? TMediumType
      : never
    : TAtomicType
  : TType extends UnionType<infer TElementType>
  ? __MediumTypeOf<TElementType, TMediumTypes>
  : TType extends IntersectionType<infer TElementType>
  ? __UnionToIntersection<__MediumTypeOf<TElementType, TMediumTypes>>
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
  });

  if (pendingMergeKeyToValues) {
    for (let [key, values] of pendingMergeKeyToValues) {
      (merged as any)[key] = merge(values);
    }
  }

  return merged;
}
