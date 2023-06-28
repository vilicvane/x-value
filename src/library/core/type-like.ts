import type {Exact} from './@exact-context';
import type {TypeIssue, TypePath} from './@type-issue';
import type {JSONSchema} from './json-schema';
import type {Medium} from './medium';
import {__type_in_mediums, __type_kind} from './type-partials';
import type {TypeInMediums} from './type-partials';

export abstract class TypeLike<
  TInMediums extends TypeInMediums = TypeInMediums,
> {
  abstract [__type_kind]: string;

  [__type_in_mediums]!: TInMediums;

  /** @internal */
  _traverse(
    input: unknown,
    path: TypePath,
    exact: Exact,
    callback: TraverseCallback,
  ): [unknown, TypeIssue[]] {
    return callback(this, input, path, exact);
  }

  /** @internal */
  _decode(
    medium: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]] {
    return this._traverse(unpacked, path, exact, (Type, value, path, exact) =>
      Type._decode(medium, value, path, exact),
    );
  }

  /** @internal */
  _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
    exact: Exact,
    diagnose: boolean,
  ): [unknown, TypeIssue[]] {
    return this._traverse(value, path, exact, (Type, value, path, exact) =>
      Type._encode(medium, value, path, exact, diagnose),
    );
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath, exact: Exact): TypeIssue[] {
    const [, issues] = this._traverse(
      value,
      path,
      exact,
      (Type, value, path, exact) => [
        undefined,
        Type._diagnose(value, path, exact),
      ],
    );

    return issues;
  }

  /** @internal */
  abstract _toJSONSchema(
    context: JSONSchemaContext,
    exact: boolean,
  ): JSONSchemaData;
}

function JSON_SCHEMA_TYPE_KEY(id: number): string {
  return `type-${id}`;
}

function JSON_SCHEMA_TYPE_REF(id: number): string {
  return `#/$defs/${JSON_SCHEMA_TYPE_KEY(id)}`;
}

export class JSONSchemaContext {
  private lastId = 0;

  private typeIdMap = new Map<TypeLike, number>();
  private exactTypeIdMap = new Map<TypeLike, number>();

  private refToDefinitionMap = new Map<string, JSONSchema>();

  readonly definitions: Record<string, JSONSchema> = {};

  define(Type: TypeLike, exact: boolean): void;
  define(Type: TypeLike, exact: boolean, definition: JSONSchema): JSONSchema;
  define(
    Type: TypeLike,
    exact: boolean,
    definition?: JSONSchema,
  ): JSONSchema | void {
    const typeIdMap = exact ? this.exactTypeIdMap : this.typeIdMap;

    let id = typeIdMap.get(Type);

    if (id === undefined) {
      id = ++this.lastId;
      typeIdMap.set(Type, id);
    }

    if (definition) {
      this.definitions[JSON_SCHEMA_TYPE_KEY(id)] = definition;

      const ref = JSON_SCHEMA_TYPE_REF(id);

      this.refToDefinitionMap.set(ref, definition);

      return {$ref: ref};
    }
  }

  getDefinition(Type: TypeLike, exact: boolean): JSONSchema | undefined {
    const typeIdMap = exact ? this.exactTypeIdMap : this.typeIdMap;

    const id = typeIdMap.get(Type);

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

export type TraverseCallback = (
  Type: TypeLike,
  value: unknown,
  path: TypePath,
  exact: Exact,
) => [unknown, TypeIssue[]];

export interface JSONSchemaData {
  schema: JSONSchema;
  optional?: boolean;
}
