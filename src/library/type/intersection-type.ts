import {Medium, MediumPackedType} from '../medium';

import {__UnionToIntersection, merge} from './@utils';
import {Type, TypeIssue, TypeOf} from './type';

export class IntersectionType<TType extends Type> extends Type<'intersection'> {
  constructor(readonly Types: TType[]) {
    if (Types.length === 0) {
      throw new TypeError();
    }

    super();
  }

  decode<TCounterMedium extends Medium<object>>(
    medium: TCounterMedium,
    value: MediumPackedType<TCounterMedium>,
  ): __UnionToIntersection<TypeOf<TType>>;
  decode(medium: Medium, value: unknown): unknown {
    return super.decode(medium, value);
  }

  encode<TCounterMedium extends Medium<object>>(
    medium: TCounterMedium,
    value: __UnionToIntersection<TypeOf<TType>>,
  ): MediumPackedType<TCounterMedium>;
  encode(medium: Medium, value: unknown): unknown {
    return super.encode(medium, value);
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
