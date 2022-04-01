import {__ObjectTypeDefinitionToMediumType, toString} from '../@utils';
import {Medium, MediumTypesPackedType} from '../medium';

import {Type, TypeIssue, TypePath} from './type';

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
  _decode(
    medium: Medium,
    unpacked: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]] {
    // TODO: implicit conversion to object?

    if (typeof unpacked !== 'object' || unpacked === null) {
      return [
        undefined,
        [
          {
            path,
            message: `Expecting unpacked value to be a non-null object, getting ${toString.call(
              unpacked,
            )}.`,
          },
        ],
      ];
    }

    let entries: [string, unknown][] = [];
    let issues: TypeIssue[] = [];

    for (let [key, Type] of Object.entries(this.definition)) {
      let [value, entryIssues] = Type._decode(medium, (unpacked as any)[key], [
        ...path,
        key,
      ]);

      entries.push([key, value]);
      issues.push(...entryIssues);
    }

    return [
      issues.length === 0 ? Object.fromEntries(entries) : undefined,
      issues,
    ];
  }

  /** @internal */
  _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]] {
    if (typeof value !== 'object' || value === null) {
      return [
        undefined,
        [
          {
            path,
            message: `Expecting value to be a non-null object, getting ${toString.call(
              value,
            )}.`,
          },
        ],
      ];
    }

    let entries: [string, unknown][] = [];
    let issues: TypeIssue[] = [];

    for (let [key, Type] of Object.entries(this.definition)) {
      let [unpacked, entryIssues] = Type._encode(medium, (value as any)[key], [
        ...path,
        key,
      ]);

      entries.push([key, unpacked]);
      issues.push(...entryIssues);
    }

    return [
      issues.length === 0 ? Object.fromEntries(entries) : undefined,
      issues,
    ];
  }

  /** @internal */
  _convert(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]] {
    if (typeof unpacked !== 'object' || unpacked === null) {
      return [
        undefined,
        [
          {
            path,
            message: `Expecting unpacked value to be a non-null object, getting ${toString.call(
              unpacked,
            )}.`,
          },
        ],
      ];
    }

    let entries: [string, unknown][] = [];
    let issues: TypeIssue[] = [];

    for (let [key, Type] of Object.entries(this.definition)) {
      let [convertedUnpacked, entryIssues] = Type._convert(
        from,
        to,
        (unpacked as any)[key],
        [...path, key],
      );

      entries.push([key, convertedUnpacked]);
      issues.push(...entryIssues);
    }

    return [
      issues.length === 0 ? Object.fromEntries(entries) : undefined,
      issues,
    ];
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath): TypeIssue[] {
    if (typeof value !== 'object' || value === null) {
      return [
        {
          path,
          message: `Expecting a non-null object, getting ${toString.call(
            value,
          )}.`,
        },
      ];
    }

    return Object.entries(this.definition).flatMap(([key, Type]) =>
      Type._diagnose((value as any)[key], [...path, key]),
    );
  }
}

export function object<TTypeDefinition extends Record<string, Type>>(
  definition: TTypeDefinition,
): ObjectType<TTypeDefinition> {
  return new ObjectType(definition);
}
