import type {Exact} from './@exact-context';
import type {TypeIssue, TypePath} from './@type-issue';
import {hasNonDeferrableTypeIssue} from './@type-issue';
import type {Medium} from './medium';
import {DISABLED_EXACT_CONTEXT_RESULT, Type} from './type';
import type {JSONSchemaContext, JSONSchemaData} from './type-like';
import type {TypeInMediumsPartial, __type_in_mediums} from './type-partials';
import {__type_kind} from './type-partials';

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
  _decode(
    medium: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]] {
    if (!Array.isArray(unpacked)) {
      return [
        undefined,
        [
          {
            path,
            message: `Expecting unpacked value to be an array, getting ${toString.call(
              unpacked,
            )}.`,
          },
        ],
      ];
    }

    const ElementType = this.ElementType;

    const {context, nestedExact} = this.getExactContext(exact, false);

    const value: unknown[] = [];
    const issues: TypeIssue[] = [];

    for (const [index, unpackedElement] of unpacked.entries()) {
      const [element, entryIssues] = ElementType._decode(
        medium,
        unpackedElement,
        [...path, index],
        nestedExact,
      );

      value.push(element);
      issues.push(...entryIssues);
    }

    context?.addKeys(Array.from(unpacked.keys(), key => key.toString()));

    return [hasNonDeferrableTypeIssue(issues) ? undefined : value, issues];
  }

  /** @internal */
  _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
    exact: Exact,
    diagnose: boolean,
  ): [unknown, TypeIssue[]] {
    if (diagnose && !Array.isArray(value)) {
      return [
        undefined,
        [
          {
            path,
            message: `Expecting value to be an array, getting ${toString.call(
              value,
            )}.`,
          },
        ],
      ];
    }

    const ElementType = this.ElementType;

    const {context, nestedExact} = diagnose
      ? this.getExactContext(exact, false)
      : DISABLED_EXACT_CONTEXT_RESULT;

    const unpacked: unknown[] = [];
    const issues: TypeIssue[] = [];

    for (const [index, valueElement] of (value as unknown[]).entries()) {
      const [unpackedElement, entryIssues] = ElementType._encode(
        medium,
        valueElement,
        [...path, index],
        nestedExact,
        diagnose,
      );

      unpacked.push(unpackedElement);
      issues.push(...entryIssues);
    }

    context?.addKeys(
      Array.from((value as unknown[]).keys(), key => key.toString()),
    );

    return [hasNonDeferrableTypeIssue(issues) ? undefined : unpacked, issues];
  }

  /** @internal */
  _transform(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]] {
    if (!Array.isArray(unpacked)) {
      return [
        undefined,
        [
          {
            path,
            message: `Expecting unpacked value to be an array, getting ${toString.call(
              unpacked,
            )}.`,
          },
        ],
      ];
    }

    const ElementType = this.ElementType;

    const {context, nestedExact} = this.getExactContext(exact, false);

    const value: unknown[] = [];
    const issues: TypeIssue[] = [];

    for (const [index, unpackedElement] of unpacked.entries()) {
      const [element, entryIssues] = ElementType._transform(
        from,
        to,
        unpackedElement,
        [...path, index],
        nestedExact,
      );

      value.push(element);
      issues.push(...entryIssues);
    }

    context?.addKeys(Array.from(unpacked.keys(), key => key.toString()));

    return [hasNonDeferrableTypeIssue(issues) ? undefined : value, issues];
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath, exact: Exact): TypeIssue[] {
    if (!Array.isArray(value)) {
      return [
        {
          path,
          message: `Expecting an array, getting ${toString.call(value)}.`,
        },
      ];
    }

    const ElementType = this.ElementType;

    const {context, nestedExact} = this.getExactContext(exact, false);

    const issues = value.flatMap((element, index) =>
      ElementType._diagnose(element, [...path, index], nestedExact),
    );

    context?.addKeys(Array.from(value.keys(), key => key.toString()));

    return issues;
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
