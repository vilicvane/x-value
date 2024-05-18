import type {Exact} from './@exact-context.js';
import type {TypeIssue, TypePath} from './@type-issue.js';
import {hasNonDeferrableTypeIssue} from './@type-issue.js';
import type {TupleInMedium} from './@utils.js';
import {OptionalType} from './optional-type.js';
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

  private minLength: number;
  private maxLength: number;

  constructor(ElementTypeTuple: TElementTypeTuple);
  constructor(private ElementTypeTuple: Type[]) {
    super();

    const lastNonOptionalIndex = ElementTypeTuple.findLastIndex(
      Type => !(Type instanceof OptionalType),
    );

    this.minLength = lastNonOptionalIndex < 0 ? 0 : lastNonOptionalIndex + 1;
    this.maxLength = ElementTypeTuple.length;
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

    if (input.length < this.minLength || input.length > this.maxLength) {
      return [
        undefined,
        [
          {
            path,
            message: `Expected value with ${
              this.minLength === this.maxLength
                ? this.minLength
                : `${this.minLength} to ${this.maxLength}`
            } instead of ${input.length} element(s).`,
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
  [TMediumName in XValue.UsingName]: OptionalizeTupleTail<
    TupleInMedium<TElementTypeTuple, TMediumName>
  >;
};

type OptionalizeTupleTail<T> = T extends [infer TElement, ...infer TRest]
  ? Optionalize<[TElement, ...OptionalizeTupleTail<TRest>]>
  : [];

type Optionalize<TupleSubsection> =
  EveryTupleElementInclude<TupleSubsection, undefined> extends true
    ? Partial<TupleSubsection>
    : TupleSubsection;

type EveryTupleElementInclude<T, TConstraint> = T extends [
  infer TElement,
  ...infer TRest,
]
  ? TConstraint extends TElement
    ? EveryTupleElementInclude<TRest, TConstraint>
    : false
  : true;
