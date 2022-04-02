import {numberTypeSymbol, stringTypeSymbol} from '../types';

import {ArrayType} from './array-type';
import {AtomicType} from './atomic-type';
import {IntersectionType} from './intersection-type';
import {ObjectType} from './object-type';
import {OptionalType} from './optional-type';
import {RecordType} from './record-type';
import {Type} from './type';
import {UnionType} from './union-type';

export type PossibleType =
  | ObjectType<Record<string, Type>>
  | RecordType<
      AtomicType<unknown, typeof stringTypeSymbol | typeof numberTypeSymbol>,
      Type
    >
  | ArrayType<Type>
  | AtomicType<unknown, symbol>
  | UnionType<Type>
  | IntersectionType<Type>
  | OptionalType<Type>;

export * from './type';
export * from './atomic-type';
export * from './object-type';
export * from './array-type';
export * from './intersection-type';
export * from './union-type';
export * from './optional-type';
export * from './record-type';
