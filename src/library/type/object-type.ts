import {toString} from '../@internal';
import type {Medium} from '../medium';

import {OptionalType} from './optional-type';
import type {
  TypeInMediumsPartial,
  TypeIssue,
  TypeKindPartial,
  TypePath,
  __type_in_mediums,
} from './type';
import {Type, __type_kind} from './type';

export class ObjectType<
  TDefinition extends Record<string, TypeInMediumsPartial>,
> extends Type<ObjectInMediums<TDefinition>> {
  [__type_kind]!: 'object';

  constructor(definition: TDefinition);
  constructor(readonly definition: Record<string, Type>) {
    super();
  }

  partial(): ObjectType<DefinitionPartial<TDefinition>>;
  partial(): ObjectType<Record<string, any>> {
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
  ): ObjectType<Pick<TDefinition, TKeys[number]>>;
  pick(...keys: string[]): ObjectType<Record<string, TypeInMediumsPartial>> {
    let keySet = new Set(keys);

    let definition = Object.fromEntries(
      Object.entries(this.definition).filter(([key]) => keySet.has(key)),
    );

    return new ObjectType(definition);
  }

  omit<TKeys extends string[]>(
    ...keys: TKeys
  ): ObjectType<Omit<TDefinition, TKeys[number]>>;
  omit(...keys: string[]): ObjectType<Record<string, TypeInMediumsPartial>> {
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

export function object<
  TTypeDefinition extends Record<string, TypeInMediumsPartial>,
>(definition: TTypeDefinition): ObjectType<TTypeDefinition> {
  return new ObjectType(definition);
}

type ObjectInMediums<TDefinition extends Record<string, TypeInMediumsPartial>> =
  {
    [TMediumName in XValue.UsingName]: ObjectInMedium<TDefinition, TMediumName>;
  };

type ObjectInMedium<
  TDefinition extends Record<string, TypeInMediumsPartial>,
  TMediumName extends XValue.UsingName,
> = {
  [TKey in KeyOfOptional<TDefinition>]?: TDefinition[TKey][__type_in_mediums][TMediumName];
} & {
  [TKey in KeyOfNonOptional<TDefinition>]: TDefinition[TKey][__type_in_mediums][TMediumName];
};

type KeyOfOptional<TType> = Extract<
  {
    [TKey in keyof TType]: TType[TKey] extends TypeKindPartial<'optional'>
      ? TKey
      : never;
  }[keyof TType],
  string
>;

type KeyOfNonOptional<TType> = Extract<
  {
    [TKey in keyof TType]: TType[TKey] extends TypeKindPartial<'optional'>
      ? never
      : TKey;
  }[keyof TType],
  string
>;

type DefinitionPartial<
  TDefinition extends Record<string, TypeInMediumsPartial>,
> = {
  [TKey in keyof TDefinition]: TDefinition[TKey] extends TypeKindPartial<'optional'>
    ? TDefinition[TKey]
    : OptionalType<TDefinition[TKey]>;
};
