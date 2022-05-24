import {toString} from '../@internal';
import type {Medium} from '../medium';

import {OptionalType} from './optional-type';
import type {TypeIssue, TypePath} from './type';
import {Type} from './type';

export class ObjectType<TDefinition extends Record<string, Type>> extends Type<
  __ObjectInMediums<TDefinition>
> {
  protected __type!: 'object';

  constructor(readonly definition: TDefinition) {
    super();
  }

  partial(): ObjectType<__Partial<TDefinition>>;
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
  ): ObjectType<Pick<TDefinition, TKeys[number]>>;
  pick(...keys: string[]): ObjectType<Record<string, Type>> {
    let keySet = new Set(keys);

    let definition = Object.fromEntries(
      Object.entries(this.definition).filter(([key]) => keySet.has(key)),
    );

    return new ObjectType(definition);
  }

  omit<TKeys extends string[]>(
    ...keys: TKeys
  ): ObjectType<Omit<TDefinition, TKeys[number]>>;
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

type __ObjectInMediums<TDefinition extends Record<string, Type>> = {
  [TMediumName in keyof XValue.Using]: __ObjectInMedium<
    TDefinition,
    TMediumName
  >;
};

type __ObjectInMedium<
  TDefinition extends Record<string, Type>,
  TMediumName extends keyof XValue.Using,
> = {
  [TKey in __KeyOfOptional<TDefinition>]?: TDefinition[TKey] extends OptionalType<
    Type<infer TInMediums>
  >
    ? TInMediums[TMediumName]
    : never;
} & {
  [TKey in __KeyOfNonOptional<TDefinition>]: TDefinition[TKey] extends Type<
    infer TInMediums
  >
    ? TInMediums[TMediumName]
    : never;
};

type __KeyOfOptional<TType> = Extract<
  {
    [TKey in keyof TType]: TType[TKey] extends OptionalType<Type>
      ? TKey
      : never;
  }[keyof TType],
  string
>;

type __KeyOfNonOptional<TType> = Extract<
  {
    [TKey in keyof TType]: TType[TKey] extends OptionalType<Type>
      ? never
      : TKey;
  }[keyof TType],
  string
>;

type __Partial<TDefinition extends Record<string, Type>> = {
  [TKey in keyof TDefinition]: TDefinition[TKey] extends OptionalType<Type>
    ? TDefinition[TKey]
    : OptionalType<TDefinition[TKey]>;
};
