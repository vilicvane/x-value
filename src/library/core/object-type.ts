import type {Exact} from './@exact-context';
import type {TypeIssue, TypePath} from './@type-issue';
import {hasNonDeferrableTypeIssue} from './@type-issue';
import type {JSONSchema} from './json-schema';
import {OptionalType} from './optional-type';
import {Type} from './type';
import type {
  JSONSchemaContext,
  JSONSchemaData,
  TraverseCallback,
  TypeLike,
} from './type-like';
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
    keys: TKeys,
  ): ObjectType<Pick<TDefinition, TKeys[number]>> {
    const keySet = new Set(keys);

    const definition = Object.fromEntries(
      Object.entries(this.definition).filter(([key]) => keySet.has(key)),
    );

    return Object.create(this, {definition: {value: definition}});
  }

  omit<TKeys extends (keyof TDefinition)[]>(
    keys: TKeys,
  ): ObjectType<Omit<TDefinition, TKeys[number]>> {
    const keySet = new Set(keys);

    const definition = Object.fromEntries(
      Object.entries(this.definition).filter(([key]) => !keySet.has(key)),
    );

    return Object.create(this, {definition: {value: definition}});
  }

  /** @internal */
  override _traverse(
    input: unknown,
    path: TypePath,
    exact: Exact,
    callback: TraverseCallback,
  ): [unknown, TypeIssue[]] {
    if (typeof input !== 'object' || input === null) {
      return [
        undefined,
        [
          {
            path,
            message: `Expected a non-null object, got ${toString.call(input)}.`,
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
      const [value, entryIssues] = callback(
        Type,
        (input as any)[key],
        [...path, key],
        nestedExact,
      );

      entries.push([key, value]);
      issues.push(...entryIssues);
    }

    if (typeof wrappedExact === 'object') {
      wrappedExact.addKeys(entries.map(([key]) => key));
    }

    if (managedContext) {
      issues.push(...managedContext.getUnknownKeyIssues(input, path));
    }

    return [
      hasNonDeferrableTypeIssue(issues)
        ? undefined
        : Object.fromEntries(entries),
      issues,
    ];
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

type KeyOfOptional<TType extends object> = {
  [TKey in keyof TType]: TType[TKey] extends TypeKindPartial<'optional'>
    ? TKey
    : never;
}[keyof TType];

type KeyOfNonOptional<TType extends object> = {
  [TKey in keyof TType]: TType[TKey] extends TypeKindPartial<'optional'>
    ? never
    : TKey;
}[keyof TType];

type DefinitionPartial<
  TDefinition extends Record<string, TypeInMediumsPartial>,
> = {
  [TKey in keyof TDefinition]: TDefinition[TKey] extends TypeKindPartial<'optional'>
    ? TDefinition[TKey]
    : OptionalType<TDefinition[TKey]>;
};
