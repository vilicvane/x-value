import {ArrayType} from './array-type';
import {AtomicType} from './atomic-type';
import {IntersectionType} from './intersection-type';
import {ObjectType} from './object-type';
import {OptionalType} from './optional-type';
import {Type} from './type';
import {UnionType} from './union-type';

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
