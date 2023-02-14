import type {Exact} from './@exact-context';
import type {TypeIssue, TypePath} from './@type-issue';
import type {JSONSchema} from './json-schema';
import type {Medium} from './medium';
import {__type_in_mediums, __type_kind} from './type-partials';
import type {TypesInMediums} from './type-partials';

export abstract class TypeLike<
  TInMediums extends TypesInMediums = TypesInMediums,
> {
  abstract [__type_kind]: string;

  [__type_in_mediums]!: TInMediums;

  /** @internal */
  abstract _decode(
    medium: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]];

  /** @internal */
  abstract _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
    exact: Exact,
    diagnose: boolean,
  ): [unknown, TypeIssue[]];

  /** @internal */
  abstract _transform(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]];

  /** @internal */
  abstract _diagnose(value: unknown, path: TypePath, exact: Exact): TypeIssue[];

  /** @internal */
  abstract _toJSONSchema(context: JSONSchemaContext): JSONSchemaData;
}

function JSON_SCHEMA_TYPE_KEY(id: number): string {
  return `type-${id}`;
}

function JSON_SCHEMA_TYPE_REF(id: number): string {
  return `#/$defs/${JSON_SCHEMA_TYPE_KEY(id)}`;
}

export class JSONSchemaContext {
  private typeMap = new Map<TypeLike, number>();

  private refToDefinitionMap = new Map<string, JSONSchema>();

  readonly definitions: Record<string, JSONSchema> = {};

  define(Type: TypeLike): void;
  define(Type: TypeLike, definition: JSONSchema): JSONSchema;
  define(Type: TypeLike, definition?: JSONSchema): JSONSchema | void {
    const typeMap = this.typeMap;

    let id = typeMap.get(Type);

    if (id === undefined) {
      id = typeMap.size + 1;
      typeMap.set(Type, id);
    }

    if (definition) {
      this.definitions[JSON_SCHEMA_TYPE_KEY(id)] = definition;

      const ref = JSON_SCHEMA_TYPE_REF(id);

      this.refToDefinitionMap.set(ref, definition);

      return {$ref: ref};
    }
  }

  getDefinition(Type: TypeLike): JSONSchema | undefined {
    const id = this.typeMap.get(Type);

    return typeof id === 'number'
      ? {$ref: JSON_SCHEMA_TYPE_REF(id)}
      : undefined;
  }

  requireDefinitionByRef(ref: string): JSONSchema {
    const schema = this.refToDefinitionMap.get(ref);

    /* istanbul ignore if */
    if (!schema) {
      throw new Error('Invalid JSON Schema reference');
    }

    return schema;
  }
}

export interface JSONSchemaData {
  schema: JSONSchema;
  optional?: boolean;
}
