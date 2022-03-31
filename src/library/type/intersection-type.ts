import {Medium, MediumTypesPackedType} from '../medium';

import {__UnionToIntersection, merge} from './@utils';
import {Type, TypeIssue, TypeOf} from './type';

export interface IntersectionType<TType> {
  decode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: MediumTypesPackedType<TMediumTypes>,
  ): __UnionToIntersection<TypeOf<TType>>;

  encode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: __UnionToIntersection<TypeOf<TType>>,
  ): MediumTypesPackedType<TMediumTypes>;

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
  decodeUnpacked(medium: Medium, unpacked: unknown): [unknown, TypeIssue[]] {
    let partials: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let Type of this.Types) {
      let [partial, partialIssues] = Type.decodeUnpacked(medium, unpacked);

      partials.push(partial);
      issues.push(...partialIssues);
    }

    return [issues.length === 0 ? merge(partials) : undefined, issues];
  }

  /** @internal */
  encodeUnpacked(medium: Medium, value: unknown): [unknown, TypeIssue[]] {
    let partials: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let Type of this.Types) {
      let [partial, partialIssues] = Type.encodeUnpacked(medium, value);

      partials.push(partial);
      issues.push(...partialIssues);
    }

    return [issues.length === 0 ? merge(partials) : undefined, issues];
  }

  diagnose(value: unknown): TypeIssue[] {
    return this.Types.flatMap(Type => Type.diagnose(value));
  }
}

export function intersection<TTypes extends Type[]>(
  ...Types: TTypes
): IntersectionType<TTypes[number]> {
  return new IntersectionType(Types);
}
