import {Medium, MediumPackedType} from '../medium';

import {__ObjectTypeDefinitionToMediumType} from './@utils';
import {Type, TypeIssue} from './type';

export class ObjectType<
  TTypeDefinition extends Record<string, Type>,
> extends Type<'object'> {
  constructor(readonly definition: TTypeDefinition) {
    super();
  }

  decode<TCounterMedium extends Medium<object>>(
    medium: TCounterMedium,
    value: MediumPackedType<TCounterMedium>,
  ): __ObjectTypeDefinitionToMediumType<TTypeDefinition, XValue.Types>;
  decode(medium: Medium, value: unknown): unknown {
    return super.decode(medium, value);
  }

  /** @internal */
  decodeUnpacked(medium: Medium, unpacked: unknown): [unknown, TypeIssue[]] {
    // TODO: implicit conversion to object?

    if (typeof unpacked !== 'object' || unpacked === null) {
      return [
        undefined,
        [
          {
            message: `Expecting unpacked value to be a non-null object, getting ${unpacked}.`,
          },
        ],
      ];
    }

    let entries: [string, unknown][] = [];
    let issues: TypeIssue[] = [];

    for (let [key, Type] of Object.entries(this.definition)) {
      let [value, entryIssues] = Type.decodeUnpacked(
        medium,
        (unpacked as any)[key],
      );

      entries.push([key, value]);
      issues.push(...entryIssues);
    }

    return [
      issues.length === 0 ? Object.fromEntries(entries) : undefined,
      issues,
    ];
  }

  diagnose(value: unknown): TypeIssue[] {
    if (typeof value !== 'object' || value === null) {
      return [
        {
          message: `Expecting a non-null object, getting ${value}.`,
        },
      ];
    }

    return Object.entries(this.definition).flatMap(([key, Type]) =>
      Type.diagnose((value as any)[key]),
    );
  }
}

export function object<TTypeDefinition extends Record<string, Type>>(
  definition: TTypeDefinition,
): ObjectType<TTypeDefinition> {
  return new ObjectType(definition);
}
