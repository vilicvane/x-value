import {__ObjectTypeDefinitionToMediumType} from '../@utils';
import {Medium, MediumTypesPackedType} from '../medium';

import {Type, TypeIssue} from './type';

export interface ObjectType<TTypeDefinition> {
  decode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    packed: MediumTypesPackedType<
      TMediumTypes,
      __ObjectTypeDefinitionToMediumType<TTypeDefinition, TMediumTypes, true>
    >,
  ): __ObjectTypeDefinitionToMediumType<TTypeDefinition, XValue.Types, false>;

  encode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: __ObjectTypeDefinitionToMediumType<
      TTypeDefinition,
      XValue.Types,
      false
    >,
  ): MediumTypesPackedType<
    TMediumTypes,
    __ObjectTypeDefinitionToMediumType<TTypeDefinition, TMediumTypes, true>
  >;

  convert<TFromMediumTypes extends object, TToMediumTypes extends object>(
    from: Medium<TFromMediumTypes>,
    to: Medium<TToMediumTypes>,
    packed: MediumTypesPackedType<
      TFromMediumTypes,
      __ObjectTypeDefinitionToMediumType<
        TTypeDefinition,
        TFromMediumTypes,
        true
      >
    >,
  ): MediumTypesPackedType<
    TToMediumTypes,
    __ObjectTypeDefinitionToMediumType<TTypeDefinition, TToMediumTypes, true>
  >;

  is(
    value: unknown,
  ): value is __ObjectTypeDefinitionToMediumType<
    TTypeDefinition,
    XValue.Types,
    false
  >;
}

export class ObjectType<
  TTypeDefinition extends Record<string, Type>,
> extends Type<'object'> {
  constructor(readonly definition: TTypeDefinition) {
    super();
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

  /** @internal */
  encodeUnpacked(medium: Medium, value: unknown): [unknown, TypeIssue[]] {
    if (typeof value !== 'object' || value === null) {
      return [
        undefined,
        [
          {
            message: `Expecting value to be a non-null object, getting ${value}.`,
          },
        ],
      ];
    }

    let entries: [string, unknown][] = [];
    let issues: TypeIssue[] = [];

    for (let [key, Type] of Object.entries(this.definition)) {
      let [unpacked, entryIssues] = Type.encodeUnpacked(
        medium,
        (value as any)[key],
      );

      entries.push([key, unpacked]);
      issues.push(...entryIssues);
    }

    return [
      issues.length === 0 ? Object.fromEntries(entries) : undefined,
      issues,
    ];
  }

  /** @internal */
  convertUnpacked(
    from: Medium,
    to: Medium,
    unpacked: unknown,
  ): [unknown, TypeIssue[]] {
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
      let [convertedUnpacked, entryIssues] = Type.convertUnpacked(
        from,
        to,
        (unpacked as any)[key],
      );

      entries.push([key, convertedUnpacked]);
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
