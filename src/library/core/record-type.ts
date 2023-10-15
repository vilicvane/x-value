import type {Exact} from './@exact-context.js';
import type {TypeIssue, TypePath} from './@type-issue.js';
import {hasNonDeferrableTypeIssue} from './@type-issue.js';
import type {
  JSONSchemaContext,
  JSONSchemaData,
  TraverseCallback,
} from './type-like.js';
import type {TypeInMediumsPartial, __type_in_mediums} from './type-partials.js';
import {__type_kind} from './type-partials.js';
import {Type} from './type.js';

const toString = Object.prototype.toString;

export class RecordType<
  TKeyType extends TypeInMediumsPartial,
  TValueType extends TypeInMediumsPartial,
> extends Type<RecordInMediums<TKeyType, TValueType>> {
  readonly [__type_kind] = 'record';

  constructor(Key: TKeyType, Value: TValueType);
  constructor(
    private Key: Type,
    private Value: Type,
  ) {
    super();
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

    const Key = this.Key;
    const Value = this.Value;

    const {context, nestedExact} = this.getExactContext(exact, false);

    context?.neutralize();

    const entries: [string | number, unknown][] = [];
    const aggregatedIssues: TypeIssue[] = [];

    for (const [key, value] of getRecordEntries(input)) {
      const keyIssues = Key._diagnose(key, [...path, {key}], nestedExact);

      const [output, valueIssues] = Value._traverse(
        value,
        [...path, key],
        nestedExact,
        callback,
      );

      entries.push([key, output]);

      aggregatedIssues.push(...keyIssues, ...valueIssues);
    }

    return [
      hasNonDeferrableTypeIssue(aggregatedIssues)
        ? undefined
        : buildRecord(entries, input),
      aggregatedIssues,
    ];
  }

  /** @internal */
  _toJSONSchema(context: JSONSchemaContext, exact: boolean): JSONSchemaData {
    exact = this._exact ?? exact;

    return {
      schema: context.define(this, exact, {
        type: 'object',
        propertyNames: this.Key._toJSONSchema(context, exact).schema,
        additionalProperties: this.Value._toJSONSchema(context, exact).schema,
      }),
    };
  }
}

export function record<
  TKeyType extends TypeInMediumsPartial,
  TValueType extends TypeInMediumsPartial,
>(Key: TKeyType, Value: TValueType): RecordType<TKeyType, TValueType> {
  return new RecordType(Key, Value);
}

type RecordInMediums<
  TKeyType extends TypeInMediumsPartial,
  TValueType extends TypeInMediumsPartial,
> = {
  [TMediumName in XValue.UsingName]: Record<
    Extract<TKeyType[__type_in_mediums][TMediumName], string | symbol>,
    TValueType[__type_in_mediums][TMediumName]
  >;
};

function getRecordEntries(value: object): [string | number, unknown][] {
  if (Array.isArray(value)) {
    return [...value.entries()];
  } else {
    return Object.entries(value);
  }
}

function buildRecord(
  entries: [string | number, unknown][],
  source: object,
): Record<string, unknown> | unknown[] {
  if (Array.isArray(source)) {
    const array: unknown[] = [];

    for (const [index, value] of entries) {
      array[index as number] = value;
    }

    return array;
  } else {
    return Object.fromEntries(entries);
  }
}
