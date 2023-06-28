import type {Exact} from './@exact-context';
import type {TypeIssue, TypePath} from './@type-issue';
import {hasNonDeferrableTypeIssue} from './@type-issue';
import type {TupleInMedium} from './@utils';
import type {JSONSchema} from './json-schema';
import {Type} from './type';
import type {
  JSONSchemaContext,
  JSONSchemaData,
  TraverseCallback,
} from './type-like';
import {__type_kind} from './type-partials';
import type {TypeInMediumsPartial} from './type-partials';

const hasOwnProperty = Object.prototype.hasOwnProperty;

export class IntersectionType<
  TTypeTuple extends [
    TypeInMediumsPartial,
    TypeInMediumsPartial,
    ...TypeInMediumsPartial[],
  ],
> extends Type<IntersectionInMediums<TTypeTuple>> {
  readonly [__type_kind] = 'intersection';

  constructor(TypeTuple: TTypeTuple);
  constructor(private TypeTuple: Type[]) {
    if (TypeTuple.length < 2) {
      throw new TypeError('Expected at least 2 elements for intersection type');
    }

    super();
  }

  /** @internal */
  override _traverse(
    input: unknown,
    path: TypePath,
    exact: Exact,
    callback: TraverseCallback,
  ): [unknown, TypeIssue[]] {
    const {managedContext, wrappedExact} = this.getExactContext(
      exact,
      'managed',
    );

    const partials: unknown[] = [];
    const issues: TypeIssue[] = [];

    for (const Type of this.TypeTuple) {
      const [partial, partialIssues] = callback(
        Type,
        input,
        path,
        wrappedExact,
      );

      partials.push(partial);
      issues.push(...partialIssues);
    }

    if (managedContext) {
      issues.push(...managedContext.getUnknownKeyIssues(input, path));
    }

    return [
      hasNonDeferrableTypeIssue(issues)
        ? undefined
        : internal_mergeIntersectionPartials(partials),
      issues,
    ];
  }

  /** @internal */
  _toJSONSchema(context: JSONSchemaContext, exact: boolean): JSONSchemaData {
    exact = this._exact ?? exact;

    const schemas = this.TypeTuple.map(
      Type => Type._toJSONSchema(context, exact).schema,
    );

    // JSON schema "allOf" is not good enough for intersection type, if any
    // schema in "allOf" has "additionalProperties: false", then the result
    // schema would result in a self-contradiction.

    let mergedSchema = mergeIntersectionJSONSchemas(context, schemas);

    if (exact && mergedSchema.additionalProperties === undefined) {
      mergedSchema = {
        ...mergedSchema,
        additionalProperties: false,
      };
    }

    return {
      schema: context.define(this, exact, mergedSchema),
    };
  }
}

export function intersection<
  TTypeTuple extends [
    TypeInMediumsPartial,
    TypeInMediumsPartial,
    ...TypeInMediumsPartial[],
  ],
>(Types: TTypeTuple): IntersectionType<TTypeTuple> {
  return new IntersectionType(Types);
}

export type IntersectionInMediums<TTypeTuple extends TypeInMediumsPartial[]> = {
  [TMediumName in XValue.UsingName]: __Intersection<
    TupleInMedium<TTypeTuple, TMediumName>
  >;
};

type __Intersection<TTuple extends unknown[]> = TTuple extends [
  infer T,
  ...infer TRestTuple,
]
  ? T & __Intersection<TRestTuple>
  : unknown;

export function internal_mergeIntersectionPartials(
  partials: unknown[],
): unknown {
  let pendingMergeKeyToValues: Map<string | number, unknown[]> | undefined;

  const merged = partials.reduce((merged, partial) => {
    if (merged === partial) {
      return merged;
    }

    if (typeof merged === 'object') {
      if (merged === null || typeof partial !== 'object' || partial === null) {
        throw new TypeError(
          'Cannot merge object and non-object for intersection',
        );
      }

      for (const [key, value] of Object.entries(partial)) {
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

    return partial;
  });

  if (pendingMergeKeyToValues) {
    for (const [key, values] of pendingMergeKeyToValues) {
      (merged as any)[key] = internal_mergeIntersectionPartials(values);
    }
  }

  return merged;
}

function mergeIntersectionJSONSchemas(
  context: JSONSchemaContext,
  schemas: JSONSchema[],
): JSONSchema {
  const requiredSet = new Set<string>();

  const properties: Record<string, JSONSchema> = {};

  let additionalProperties: JSONSchema | boolean | undefined;

  for (let schema of schemas) {
    if (schema.$ref) {
      schema = context.requireDefinitionByRef(schema.$ref);
    }

    if (schema.type !== 'object') {
      throw new TypeError('Cannot merge non-object JSON schemas');
    }

    if (schema.required) {
      for (const key of schema.required) {
        requiredSet.add(key);
      }
    }

    if (schema.properties) {
      for (const [key, propertySchema] of Object.entries(schema.properties)) {
        if (hasOwnProperty.call(properties, key)) {
          properties[key] = mergeIntersectionJSONSchemas(context, [
            properties[key],
            propertySchema,
          ]);
        } else {
          properties[key] = propertySchema;
        }
      }
    }

    if (schema.additionalProperties !== undefined) {
      additionalProperties = schema.additionalProperties;
    }
  }

  return {
    type: 'object',
    required: Array.from(requiredSet),
    properties,
    ...(additionalProperties !== undefined
      ? {additionalProperties}
      : undefined),
  };
}
