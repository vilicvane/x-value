import type {TypeIssue} from './@type-issue';
import {TypeConstraintError} from './errors';
import type {JSONSchema} from './json-schema';
import {MediumType} from './medium-type';
import {JSONSchemaContext} from './type-like';
import type {
  TypeInMediumsPartial,
  TypesInMediums,
  __type_in_mediums,
} from './type-partials';

export abstract class Type<
  TInMediums extends TypesInMediums = TypesInMediums,
> extends MediumType<TInMediums> {
  satisfies(value: unknown): TInMediums['value'] {
    const issues = this.diagnose(value);

    if (issues.length > 0) {
      throw new TypeConstraintError('Value does not satisfy the type', issues);
    }

    return value;
  }

  asserts(value: unknown): void {
    this.satisfies(value);
  }

  is(value: unknown): value is TInMediums['value'] {
    return this.diagnose(value).length === 0;
  }

  diagnose(value: unknown): TypeIssue[] {
    return this._diagnose(value, [], this._exact ?? false);
  }

  toJSONSchema(): JSONSchema {
    const context = new JSONSchemaContext();

    return {
      ...this._toJSONSchema(context, this._exact ?? false).schema,
      $defs: context.definitions,
    };
  }
}

export type TypeOf<TType extends TypeInMediumsPartial> =
  TType[__type_in_mediums]['value'];
