import type {Exact} from './@exact-context.js';
import type {TypeIssue, TypePath} from './@type-issue.js';
import {hasNonDeferrableTypeIssue} from './@type-issue.js';
import type {TupleInMedium} from './@utils.js';
import type {
  JSONSchemaContext,
  JSONSchemaData,
  TraverseCallback,
} from './type-like.js';
import type {TypeInMediumsPartial} from './type-partials.js';
import {__type_kind} from './type-partials.js';
import {Type} from './type.js';

const toString = Object.prototype.toString;

export class TupleType<
  TElementTypeTuple extends TypeInMediumsPartial[],
> extends Type<TupleInMediums<TElementTypeTuple>> {
  readonly [__type_kind] = 'tuple';

  constructor(ElementTypeTuple: TElementTypeTuple);
  constructor(private ElementTypeTuple: Type[]) {
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

    const ElementTypeTuple = this.ElementTypeTuple;

    if (input.length !== ElementTypeTuple.length) {
      return [
        undefined,
        [
          {
            path,
            message: `Expected value with ${ElementTypeTuple.length} instead of ${input.length} element(s).`,
          },
        ],
      ];
    }

    const {context, nestedExact} = this.getExactContext(exact, false);

    const value: unknown[] = [];
    const issues: TypeIssue[] = [];

    for (const [index, Element] of ElementTypeTuple.entries()) {
      const [element, entryIssues] = callback(
        Element,
        input[index],
        [...path, index],
        nestedExact,
      );

      value.push(element);
      issues.push(...entryIssues);
    }

    context?.addKeys(
      Array.from(ElementTypeTuple.keys(), key => key.toString()),
    );

    return [hasNonDeferrableTypeIssue(issues) ? undefined : value, issues];
  }

  /** @internal */
  _toJSONSchema(context: JSONSchemaContext, exact: boolean): JSONSchemaData {
    exact = this._exact ?? exact;

    return {
      schema: context.define(this, exact, {
        type: 'array',
        prefixItems: this.ElementTypeTuple.map(
          Element => Element._toJSONSchema(context, exact).schema,
        ),
      }),
    };
  }
}

export function tuple<
  TElementTypeTuple extends
    | []
    | [TypeInMediumsPartial, ...TypeInMediumsPartial[]],
>(ElementTypeTuple: TElementTypeTuple): TupleType<TElementTypeTuple> {
  return new TupleType(ElementTypeTuple);
}

type TupleInMediums<TElementTypeTuple extends TypeInMediumsPartial[]> = {
  [TMediumName in XValue.UsingName]: TupleInMedium<
    TElementTypeTuple,
    TMediumName
  >;
};
