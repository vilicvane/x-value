import type {
  __ElementOrArray,
  __MediumTypeOf,
  __MediumTypesPackedType,
  __RefinedType,
  __UnionToIntersection,
} from '../@utils';
import {merge} from '../@utils';
import type {Medium} from '../medium';

import type {TypeConstraint, TypeIssue, TypeOf, TypePath} from './type';
import {Type} from './type';

export interface IntersectionType<TTypeTuple> {
  refine<TNominalOrRefinement, TNominal = unknown>(
    constraints: __ElementOrArray<
      TypeConstraint<__UnionToIntersection<TypeOf<TTypeTuple[number]>>>
    >,
  ): __RefinedType<this, TNominalOrRefinement, TNominal>;

  decode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: __MediumTypesPackedType<
      TMediumTypes,
      __UnionToIntersection<__MediumTypeOf<TTypeTuple[number], TMediumTypes>>
    >,
  ): __UnionToIntersection<TypeOf<TTypeTuple[number]>>;

  encode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: __UnionToIntersection<TypeOf<TTypeTuple[number]>>,
  ): __MediumTypesPackedType<
    TMediumTypes,
    __UnionToIntersection<__MediumTypeOf<TTypeTuple[number], TMediumTypes>>
  >;

  transform<TFromMediumTypes extends object, TToMediumTypes extends object>(
    from: Medium<TFromMediumTypes>,
    to: Medium<TToMediumTypes>,
    value: __MediumTypesPackedType<
      TFromMediumTypes,
      __UnionToIntersection<
        __MediumTypeOf<TTypeTuple[number], TFromMediumTypes>
      >
    >,
  ): __MediumTypesPackedType<
    TToMediumTypes,
    __UnionToIntersection<__MediumTypeOf<TTypeTuple[number], TToMediumTypes>>
  >;

  is(
    value: unknown,
  ): value is __UnionToIntersection<TypeOf<TTypeTuple[number]>>;
}

export class IntersectionType<
  TTypeTuple extends Type[],
> extends Type<'intersection'> {
  constructor(readonly Types: TTypeTuple) {
    if (Types.length < 2) {
      throw new TypeError('Expecting at least 2 types for intersection type');
    }

    super();
  }

  /** @internal */
  _decode(
    medium: Medium,
    unpacked: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]] {
    let partials: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let Type of this.Types) {
      let [partial, partialIssues] = Type._decode(medium, unpacked, path);

      partials.push(partial);
      issues.push(...partialIssues);
    }

    return [issues.length === 0 ? merge(partials) : undefined, issues];
  }

  /** @internal */
  _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
    diagnose: boolean,
  ): [unknown, TypeIssue[]] {
    let partials: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let Type of this.Types) {
      let [partial, partialIssues] = Type._encode(
        medium,
        value,
        path,
        diagnose,
      );

      partials.push(partial);
      issues.push(...partialIssues);
    }

    return [issues.length === 0 ? merge(partials) : undefined, issues];
  }

  /** @internal */
  _transform(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]] {
    let partials: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let Type of this.Types) {
      let [partial, partialIssues] = Type._transform(from, to, unpacked, path);

      partials.push(partial);
      issues.push(...partialIssues);
    }

    return [issues.length === 0 ? merge(partials) : undefined, issues];
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath): TypeIssue[] {
    return this.Types.flatMap(Type => Type._diagnose(value, path));
  }
}

export function intersection<TTypeTuple extends [Type, Type, ...Type[]]>(
  ...Types: TTypeTuple
): IntersectionType<TTypeTuple> {
  return new IntersectionType(Types);
}
