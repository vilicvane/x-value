import {toString} from '../@internal';
import type {Medium} from '../medium';

import {OptionalType} from './optional-type';
import type {
  Exact,
  TypeInMediumsPartial,
  TypeIssue,
  TypeKindPartial,
  TypeLike,
  TypePath,
  __type_in_mediums,
} from './type';
import {Type, __type_kind} from './type';

export class ObjectType<
  TDefinition extends Record<string, TypeInMediumsPartial>,
> extends Type<ObjectInMediums<TDefinition>> {
  [__type_kind]!: 'object';

  constructor(definition: TDefinition);
  constructor(readonly definition: Record<string, TypeLike>) {
    super();
  }

  partial(): ObjectType<DefinitionPartial<TDefinition>> {
    let definition = Object.fromEntries(
      Object.entries(this.definition).map(([key, Type]) => [
        key,
        Type instanceof OptionalType ? Type : new OptionalType(Type),
      ]),
    );

    return Object.create(this, {definition: {value: definition}});
  }

  pick<TKeys extends string[]>(
    ...keys: TKeys
  ): ObjectType<Pick<TDefinition, TKeys[number]>> {
    let keySet = new Set(keys);

    let definition = Object.fromEntries(
      Object.entries(this.definition).filter(([key]) => keySet.has(key)),
    );

    return Object.create(this, {definition: {value: definition}});
  }

  omit<TKeys extends string[]>(
    ...keys: TKeys
  ): ObjectType<Omit<TDefinition, TKeys[number]>> {
    let keySet = new Set(keys);

    let definition = Object.fromEntries(
      Object.entries(this.definition).filter(([key]) => !keySet.has(key)),
    );

    return Object.create(this, {definition: {value: definition}});
  }

  /** @internal */
  _decode(
    medium: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
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

    let {managedContext, wrappedExact, nestedExact} = this.getExactContext(
      exact,
      'managed',
    );

    let entries: [string, unknown][] = [];
    let issues: TypeIssue[] = [];

    for (let [key, Type] of Object.entries(this.definition)) {
      let [value, entryIssues] = Type._decode(
        medium,
        (unpacked as any)[key],
        [...path, key],
        nestedExact,
      );

      entries.push([key, value]);
      issues.push(...entryIssues);
    }

    if (wrappedExact) {
      wrappedExact.addKeys(entries.map(([key]) => key));
    }

    if (managedContext) {
      issues.push(...managedContext.getIssues(unpacked, path));
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
    exact: Exact,
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

    let {managedContext, wrappedExact, nestedExact} = diagnose
      ? this.getExactContext(exact, 'managed')
      : {
          managedContext: undefined,
          wrappedExact: false as false,
          nestedExact: false,
        };

    let entries: [string, unknown][] = [];
    let issues: TypeIssue[] = [];

    for (let [key, Type] of Object.entries(this.definition)) {
      let [unpacked, entryIssues] = Type._encode(
        medium,
        (value as any)[key],
        [...path, key],
        nestedExact,
        diagnose,
      );

      entries.push([key, unpacked]);
      issues.push(...entryIssues);
    }

    if (wrappedExact) {
      wrappedExact.addKeys(entries.map(([key]) => key));
    }

    if (managedContext) {
      issues.push(...managedContext.getIssues(value, path));
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
    exact: Exact,
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

    let {managedContext, wrappedExact, nestedExact} = this.getExactContext(
      exact,
      'managed',
    );

    let entries: [string, unknown][] = [];
    let issues: TypeIssue[] = [];

    for (let [key, Type] of Object.entries(this.definition)) {
      let [transformedUnpacked, entryIssues] = Type._transform(
        from,
        to,
        (unpacked as any)[key],
        [...path, key],
        nestedExact,
      );

      entries.push([key, transformedUnpacked]);
      issues.push(...entryIssues);
    }

    if (wrappedExact) {
      wrappedExact.addKeys(entries.map(([key]) => key));
    }

    if (managedContext) {
      issues.push(...managedContext.getIssues(unpacked, path));
    }

    return [
      issues.length === 0 ? Object.fromEntries(entries) : undefined,
      issues,
    ];
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath, exact: Exact): TypeIssue[] {
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

    let {managedContext, wrappedExact, nestedExact} = this.getExactContext(
      exact,
      'managed',
    );

    let issues: TypeIssue[] = [];
    let entries = Object.entries(this.definition);

    for (let [key, Type] of entries) {
      issues.push(
        ...Type._diagnose((value as any)[key], [...path, key], nestedExact),
      );
    }

    if (wrappedExact) {
      wrappedExact.addKeys(entries.map(([key]) => key));
    }

    if (managedContext) {
      issues.push(...managedContext.getIssues(value, path));
    }

    return issues;
  }
}

export function object<
  TDefinition extends Record<string, TypeInMediumsPartial>,
>(definition: TDefinition): ObjectType<TDefinition> {
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
} extends infer T
  ? {[TKey in keyof T]: T[TKey]}
  : never;

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
