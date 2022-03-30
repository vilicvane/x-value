import {ArrayType} from './array-type';
import {AtomicType} from './atomic-type';
import {IntersectionType} from './intersection-type';
import {ObjectType} from './object-type';
import {OptionalType} from './optional-type';
import {Type} from './type';
import {UnionType} from './union-type';

export type PossibleType =
  | AtomicType<unknown, symbol>
  | ObjectType<Record<string, Type>>
  | ArrayType<Type>
  | UnionType<Type>
  | IntersectionType<Type>
  | OptionalType<Type>;

export * from './array-type';
export * from './atomic-type';
export * from './intersection-type';
export * from './object-type';
export * from './optional-type';
export * from './type';
export * from './union-type';
