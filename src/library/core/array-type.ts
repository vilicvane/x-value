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

export class ArrayType<TElementType extends TypeInMediumsPartial> extends Type<
  ArrayInMediums<TElementType>
> {
  readonly [__type_kind] = 'array';

  constructor(ElementType: TElementType);
  constructor(private ElementType: Type) {
    super();
  }

  /** @internal */
  override _traverse(
    input: unknown,
    path: TypePath,
    exact: Exact,
    callback: TraverseCallback,
  ): [unknown, TypeIssue[]] {
    if (!Array.isArray(input)) {
      return [
        undefined,
        [
          {
            path,
            message: `Expected an array, got ${toString.call(input)}.`,
          },
        ],
      ];
    }

    const ElementType = this.ElementType;

    const {context, nestedExact} = this.getExactContext(exact, false);

    const output: unknown[] = [];
    const issues: TypeIssue[] = [];

    for (const [index, value] of input.entries()) {
      const [element, entryIssues] = ElementType._traverse(
        value,
        [...path, index],
        nestedExact,
        callback,
      );

      output.push(element);
      issues.push(...entryIssues);
    }

    context?.addKeys(Array.from(input.keys(), key => key.toString()));

    return [hasNonDeferrableTypeIssue(issues) ? undefined : output, issues];
  }

  /** @internal */
  _toJSONSchema(context: JSONSchemaContext, exact: boolean): JSONSchemaData {
    exact = this._exact ?? exact;

    return {
      schema: context.define(this, exact, {
        type: 'array',
        items: this.ElementType._toJSONSchema(context, exact).schema,
      }),
    };
  }
}

export function array<TElementType extends TypeInMediumsPartial>(
  ElementType: TElementType,
): ArrayType<TElementType> {
  return new ArrayType(ElementType);
}

type ArrayInMediums<TElementType extends TypeInMediumsPartial> = {
  [TKey in XValue.UsingName]: TElementType[__type_in_mediums][TKey][];
};
