import type {
  __ElementOrArray,
  __MediumTypesPackedType,
  __ObjectTypeDefinitionToMediumType,
  __RefinedType,
} from '../@utils';
import {toString} from '../@utils';
import type {Medium} from '../medium';

import {OptionalType} from './optional-type';
import type {TypeConstraint, TypeIssue, TypePath} from './type';
import {Type} from './type';

export interface ObjectType<TTypeDefinition> {
  refine<TNominalOrRefinement, TNominal = unknown>(
    constraints: __ElementOrArray<
      TypeConstraint<
        __ObjectTypeDefinitionToMediumType<TTypeDefinition, XValue.Types>
      >
    >,
  ): __RefinedType<this, TNominalOrRefinement, TNominal>;

  decode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    packed: __MediumTypesPackedType<
      TMediumTypes,
      __ObjectTypeDefinitionToMediumType<TTypeDefinition, TMediumTypes>
    >,
  ): __ObjectTypeDefinitionToMediumType<TTypeDefinition, XValue.Types>;

  encode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: __ObjectTypeDefinitionToMediumType<TTypeDefinition, XValue.Types>,
  ): __MediumTypesPackedType<
    TMediumTypes,
    __ObjectTypeDefinitionToMediumType<TTypeDefinition, TMediumTypes>
  >;

  transform<TFromMediumTypes extends object, TToMediumTypes extends object>(
    from: Medium<TFromMediumTypes>,
    to: Medium<TToMediumTypes>,
    packed: __MediumTypesPackedType<
      TFromMediumTypes,
      __ObjectTypeDefinitionToMediumType<TTypeDefinition, TFromMediumTypes>
    >,
  ): __MediumTypesPackedType<
    TToMediumTypes,
    __ObjectTypeDefinitionToMediumType<TTypeDefinition, TToMediumTypes>
  >;

  is(
    value: unknown,
  ): value is __ObjectTypeDefinitionToMediumType<TTypeDefinition, XValue.Types>;
}

export class ObjectType<
  TTypeDefinition extends Record<string, Type>,
> extends Type<'object'> {
  constructor(readonly definition: TTypeDefinition) {
    super();
  }

  partial(): ObjectType<__Partial<TTypeDefinition>>;
  partial(): ObjectType<Record<string, OptionalType<Type>>> {
    let definition = Object.fromEntries(
      Object.entries(this.definition).map(([key, Type]) => [
        key,
        Type instanceof OptionalType ? Type : new OptionalType(Type),
      ]),
    );

    return new ObjectType(definition);
  }

  pick<TKeys extends string[]>(
    ...keys: TKeys
  ): ObjectType<Pick<TTypeDefinition, TKeys[number]>>;
  pick(...keys: string[]): ObjectType<Record<string, Type>> {
    let keySet = new Set(keys);

    let definition = Object.fromEntries(
      Object.entries(this.definition).filter(([key]) => keySet.has(key)),
    );

    return new ObjectType(definition);
  }

  omit<TKeys extends string[]>(
    ...keys: TKeys
  ): ObjectType<Omit<TTypeDefinition, TKeys[number]>>;
  omit(...keys: string[]): ObjectType<Record<string, Type>> {
    let keySet = new Set(keys);

    let definition = Object.fromEntries(
      Object.entries(this.definition).filter(([key]) => !keySet.has(key)),
    );

    return new ObjectType(definition);
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
    diagnose: boolean,
  ): [unknown, TypeIssue[]] {
    if (diagnose && (typeof value !== 'object' || value === null)) {
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
      let [unpacked, entryIssues] = Type._encode(
        medium,
        (value as any)[key],
        [...path, key],
        diagnose,
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
  _transform(
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
      let [transformedUnpacked, entryIssues] = Type._transform(
        from,
        to,
        (unpacked as any)[key],
        [...path, key],
      );

      entries.push([key, transformedUnpacked]);
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

export type __Partial<TTypeDefinition extends Record<string, Type>> = {
  [TKey in keyof TTypeDefinition]: TTypeDefinition[TKey] extends OptionalType<Type>
    ? TTypeDefinition[TKey]
    : OptionalType<TTypeDefinition[TKey]>;
};
