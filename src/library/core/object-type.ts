import type {Exact} from './@exact-context';
import type {TypeIssue, TypePath} from './@type-issue';
import {hasNonDeferrableTypeIssue} from './@type-issue';
import type {JSONSchema} from './json-schema';
import type {Medium} from './medium';
import {OptionalType} from './optional-type';
import {Type} from './type';
import type {JSONSchemaContext, JSONSchemaData, TypeLike} from './type-like';
import type {
  TypeInMediumsPartial,
  TypeKindPartial,
  __type_in_mediums,
} from './type-partials';
import {__type_kind} from './type-partials';

const toString = Object.prototype.toString;

export class ObjectType<
  TDefinition extends Record<string, TypeInMediumsPartial>,
> extends Type<ObjectInMediums<TDefinition>> {
  readonly [__type_kind] = 'object';

  constructor(definition: TDefinition);
  constructor(private definition: Record<string, TypeLike>) {
    super();
  }

  extend<TDefinitionExtension extends Record<string, TypeInMediumsPartial>>(
    extension: ObjectType<TDefinitionExtension> | TDefinitionExtension,
  ): ObjectType<
    Omit<TDefinition, keyof TDefinitionExtension> & TDefinitionExtension
  > {
    return Object.create(this, {
      definition: {
        value: {
          ...this.definition,
          ...(extension instanceof ObjectType
            ? extension.definition
            : extension),
        },
      },
    });
  }

  partial(): ObjectType<DefinitionPartial<TDefinition>> {
    const definition = Object.fromEntries(
      Object.entries(this.definition).map(([key, Type]) => [
        key,
        Type instanceof OptionalType ? Type : new OptionalType(Type),
      ]),
    );

    return Object.create(this, {definition: {value: definition}});
  }

  pick<TKeys extends (keyof TDefinition)[]>(
    ...keys: TKeys
  ): ObjectType<Pick<TDefinition, TKeys[number]>> {
    const keySet = new Set(keys);

    const definition = Object.fromEntries(
      Object.entries(this.definition).filter(([key]) => keySet.has(key)),
    );

    return Object.create(this, {definition: {value: definition}});
  }

  omit<TKeys extends (keyof TDefinition)[]>(
    ...keys: TKeys
  ): ObjectType<Omit<TDefinition, TKeys[number]>> {
    const keySet = new Set(keys);

    const definition = Object.fromEntries(
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

    const {managedContext, wrappedExact, nestedExact} = this.getExactContext(
      exact,
      'managed',
    );

    const entries: [string, unknown][] = [];
    const issues: TypeIssue[] = [];

    for (const [key, Type] of Object.entries(this.definition)) {
      const [value, entryIssues] = Type._decode(
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
      issues.push(...managedContext.getUnknownKeyIssues(unpacked, path));
    }

    return [
      hasNonDeferrableTypeIssue(issues)
        ? undefined
        : Object.fromEntries(entries),
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

    const {managedContext, wrappedExact, nestedExact} = diagnose
      ? this.getExactContext(exact, 'managed')
      : {
          managedContext: undefined,
          wrappedExact: false as false,
          nestedExact: false,
        };

    const entries: [string, unknown][] = [];
    const issues: TypeIssue[] = [];

    for (const [key, Type] of Object.entries(this.definition)) {
      const [unpacked, entryIssues] = Type._encode(
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
      issues.push(...managedContext.getUnknownKeyIssues(value, path));
    }

    return [
      hasNonDeferrableTypeIssue(issues)
        ? undefined
        : Object.fromEntries(entries),
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

    const {managedContext, wrappedExact, nestedExact} = this.getExactContext(
      exact,
      'managed',
    );

    const entries: [string, unknown][] = [];
    const issues: TypeIssue[] = [];

    for (const [key, Type] of Object.entries(this.definition)) {
      const [transformedUnpacked, entryIssues] = Type._transform(
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
      issues.push(...managedContext.getUnknownKeyIssues(unpacked, path));
    }

    return [
      hasNonDeferrableTypeIssue(issues)
        ? undefined
        : Object.fromEntries(entries),
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

    const {managedContext, wrappedExact, nestedExact} = this.getExactContext(
      exact,
      'managed',
    );

    const issues: TypeIssue[] = [];
    const entries = Object.entries(this.definition);

    for (const [key, Type] of entries) {
      issues.push(
        ...Type._diagnose((value as any)[key], [...path, key], nestedExact),
      );
    }

    if (wrappedExact) {
      wrappedExact.addKeys(entries.map(([key]) => key));
    }

    if (managedContext) {
      issues.push(...managedContext.getUnknownKeyIssues(value, path));
    }

    return issues;
  }

  /** @internal */
  _toJSONSchema(context: JSONSchemaContext, exact: boolean): JSONSchemaData {
    exact = this._exact ?? exact;

    const required: string[] = [];

    const properties: Record<string, JSONSchema> = {};

    for (const [key, Type] of Object.entries(this.definition)) {
      const {schema, optional = false} = Type._toJSONSchema(context, exact);

      if (!optional) {
        required.push(key);
      }

      properties[key] = schema;
    }

    return {
      schema: context.define(this, exact, {
        type: 'object',
        required,
        properties,
        ...(exact ? {additionalProperties: false} : undefined),
      }),
    };
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
