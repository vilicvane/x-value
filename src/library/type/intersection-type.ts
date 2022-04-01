import {__MediumTypeOf, __UnionToIntersection, merge} from '../@utils';
import {Medium, MediumTypesPackedType} from '../medium';

import {Type, TypeIssue, TypeOf, TypePath} from './type';

export interface IntersectionType<TType> {
  decode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: MediumTypesPackedType<
      TMediumTypes,
      __UnionToIntersection<__MediumTypeOf<TType, TMediumTypes, true>>
    >,
  ): __UnionToIntersection<TypeOf<TType>>;

  encode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: __UnionToIntersection<TypeOf<TType>>,
  ): MediumTypesPackedType<
    TMediumTypes,
    __UnionToIntersection<__MediumTypeOf<TType, TMediumTypes, true>>
  >;

  convert<TFromMediumTypes extends object, TToMediumTypes extends object>(
    from: Medium<TFromMediumTypes>,
    to: Medium<TToMediumTypes>,
    value: MediumTypesPackedType<
      TFromMediumTypes,
      __UnionToIntersection<__MediumTypeOf<TType, TFromMediumTypes, true>>
    >,
  ): MediumTypesPackedType<
    TToMediumTypes,
    __UnionToIntersection<__MediumTypeOf<TType, TToMediumTypes, true>>
  >;

  is(value: unknown): value is __UnionToIntersection<TypeOf<TType>>;
}

export class IntersectionType<TType extends Type> extends Type<'intersection'> {
  constructor(readonly Types: TType[]) {
    if (Types.length === 0) {
      throw new TypeError();
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
  ): [unknown, TypeIssue[]] {
    let partials: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let Type of this.Types) {
      let [partial, partialIssues] = Type._encode(medium, value, path);

      partials.push(partial);
      issues.push(...partialIssues);
    }

    return [issues.length === 0 ? merge(partials) : undefined, issues];
  }

  /** @internal */
  _convert(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]] {
    let partials: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let Type of this.Types) {
      let [partial, partialIssues] = Type._convert(from, to, unpacked, path);

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

export function intersection<TTypes extends Type[]>(
  ...Types: TTypes
): IntersectionType<TTypes[number]> {
  return new IntersectionType(Types);
}
