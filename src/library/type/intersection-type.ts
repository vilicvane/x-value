import {Medium, MediumPackedType} from '../medium';

import {__UnionToIntersection} from './@utils';
import {Type, TypeIssue, TypeOf} from './type';

const hasOwnProperty = Object.prototype.hasOwnProperty;

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

    function merge(partials: unknown[]): unknown {
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
