import {Medium, MediumPackedType} from './medium';

const hasOwnProperty = Object.prototype.hasOwnProperty;

export type TypeConstraint<T = unknown> = (value: T) => string | boolean;

export interface TypeIssue {
  message: string;
}

export class TypeConstraintError extends TypeError {
  constructor(readonly issues: TypeIssue[]) {
    super();
  }
}

export abstract class Type<TCategory extends string = string> {
  /**
   * For static type checking.
   */
  protected _category!: TCategory;

  constructor(protected constraints: TypeConstraint[] = []) {}

  refine<TSymbol extends symbol>(
    symbol: TSymbol,
    constraint: TypeConstraint,
  ): this {
    return this;
  }

  decode(medium: Medium, packed: unknown): unknown {
    let unpacked = medium.unpack(packed);
    let [value, issues] = this.decodeUnpacked(medium, unpacked);

    if (issues.length > 0) {
      throw new TypeConstraintError(issues);
    }

    return value;
  }

  /** @internal */
  abstract decodeUnpacked(
    medium: Medium,
    unpacked: unknown,
  ): [unknown, TypeIssue[]];

  diagnose(value: unknown): TypeIssue[] {
    let issues: TypeIssue[] = [];

    for (let constraint of this.constraints) {
      let result = constraint(value) ?? true;

      if (result === true) {
        continue;
      }

      issues.push({
        message: typeof result === 'string' ? result : 'Unexpected value',
      });
    }

    return issues;
  }

  satisfies<T>(value: T): T {
    let issues = this.diagnose(value);

    if (issues.length === 0) {
      return value;
    }

    throw new TypeConstraintError(issues);
  }

  is<T>(value: T): boolean {
    return this.diagnose(value).length === 0;
  }
}

export type PossibleType =
  | AtomicType<symbol>
  | ObjectType<Record<string, Type>>
  | ArrayType<Type>
  | UnionType<Type>
  | IntersectionType<Type>
  | OptionalType<Type>;

export class AtomicType<TSymbol extends symbol> extends Type<'atomic'> {
  constructor(readonly symbol: TSymbol, constraint: TypeConstraint) {
    super([constraint]);
  }

  decode<TCounterMedium extends Medium<object>>(
    medium: TCounterMedium,
    value: MediumPackedType<TCounterMedium>,
  ): TypeOf<this>;
  decode(medium: Medium, value: unknown): unknown {
    return super.decode(medium, value);
  }

  /** @internal */
  decodeUnpacked(medium: Medium, unpacked: object): [unknown, TypeIssue[]] {
    let codec = medium.requireCodec(this.symbol);
    let value = codec.decode(unpacked);

    let issues = this.diagnose(value);

    return [issues.length === 0 ? value : undefined, issues];
  }
}

export function atomic<TSymbol extends symbol>(
  symbol: TSymbol,
  constraint: TypeConstraint,
): AtomicType<TSymbol> {
  return new AtomicType(symbol, constraint);
}

export class ObjectType<
  TTypeDefinition extends Record<string, Type>,
> extends Type<'object'> {
  constructor(readonly definition: TTypeDefinition) {
    super();
  }

  decode<TCounterMedium extends Medium<object>>(
    medium: TCounterMedium,
    value: MediumPackedType<TCounterMedium>,
  ): __ObjectTypeDefinitionToMediumType<TTypeDefinition, XValue.Values>;
  decode(medium: Medium, value: unknown): unknown {
    return super.decode(medium, value);
  }

  /** @internal */
  decodeUnpacked(medium: Medium, unpacked: unknown): [unknown, TypeIssue[]] {
    // TODO: implicit conversion to object.

    if (typeof unpacked !== 'object' || unpacked === null) {
      return [
        undefined,
        [
          {
            message: `Expecting unpacked value to be a non-null object, getting ${unpacked}.`,
          },
        ],
      ];
    }

    let entries: [string, unknown][] = [];
    let issues: TypeIssue[] = [];

    for (let [key, Type] of Object.entries(this.definition)) {
      let [value, entryIssues] = Type.decodeUnpacked(
        medium,
        (unpacked as any)[key],
      );

      entries.push([key, value]);
      issues.push(...entryIssues);
    }

    let value = Object.fromEntries(entries);

    issues.push(...super.diagnose(value));

    return [issues.length === 0 ? value : undefined, issues];
  }

  diagnose(value: unknown): TypeIssue[] {
    if (typeof value !== 'object' || value === null) {
      return [
        {
          message: `Expecting a non-null object, getting ${value}.`,
        },
      ];
    }

    return [
      ...Object.entries(this.definition).flatMap(([key, Type]) =>
        Type.diagnose((value as any)[key]),
      ),
      ...super.diagnose(value),
    ];
  }
}

export function object<TTypeDefinition extends Record<string, Type>>(
  definition: TTypeDefinition,
): ObjectType<TTypeDefinition> {
  return new ObjectType(definition);
}

export class ArrayType<TElement extends Type> extends Type<'array'> {
  constructor(readonly Element: TElement) {
    super();
  }

  decode<TCounterMedium extends Medium<object>>(
    medium: TCounterMedium,
    value: MediumPackedType<TCounterMedium>,
  ): TypeOf<TElement>[];
  decode(medium: Medium, value: unknown): unknown {
    return super.decode(medium, value);
  }

  /** @internal */
  decodeUnpacked(medium: Medium, unpacked: unknown): [unknown, TypeIssue[]] {
    // TODO: implicit conversion to array.

    if (!Array.isArray(unpacked)) {
      return [
        undefined,
        [
          {
            message: `Expecting unpacked value to be an array, getting ${unpacked}.`,
          },
        ],
      ];
    }

    let Element = this.Element;

    let value: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let unpackedElement of unpacked) {
      let [element, entryIssues] = Element.decodeUnpacked(
        medium,
        unpackedElement,
      );

      value.push(element);
      issues.push(...entryIssues);
    }

    issues.push(...super.diagnose(value));

    return [issues.length === 0 ? value : undefined, issues];
  }

  diagnose(value: unknown): TypeIssue[] {
    if (!Array.isArray(value)) {
      return [
        {
          message: `Expecting an array, getting ${value}.`,
        },
      ];
    }

    let Element = this.Element;

    return [
      ...value.flatMap(element => Element.diagnose(element)),
      ...super.diagnose(value),
    ];
  }
}

export function array<TType extends Type>(type: TType): ArrayType<TType> {
  return new ArrayType(type);
}

export class UnionType<TType extends Type> extends Type<'union'> {
  constructor(readonly Types: TType[]) {
    if (Types.length === 0) {
      throw new TypeError();
    }

    super();
  }

  decode<TCounterMedium extends Medium<object>>(
    medium: TCounterMedium,
    value: MediumPackedType<TCounterMedium>,
  ): TypeOf<TType>;
  decode(medium: Medium, value: unknown): unknown {
    return super.decode(medium, value);
  }

  /** @internal */
  decodeUnpacked(medium: Medium, unpacked: unknown): [unknown, TypeIssue[]] {
    let lastIssues!: TypeIssue[];

    for (let Type of this.Types) {
      let [value, issues] = Type.decodeUnpacked(medium, unpacked);

      if (issues.length === 0) {
        return [value, issues];
      }

      lastIssues = issues;
    }

    return [
      undefined,
      [
        {
          message:
            'The unpacked value satisfies none of the type in the union type',
        },
        ...lastIssues,
      ],
    ];
  }

  diagnose(value: unknown): TypeIssue[] {
    let lastIssues!: TypeIssue[];

    for (let Type of this.Types) {
      let issues = Type.diagnose(value);

      lastIssues = issues;

      if (issues.length === 0) {
        break;
      }
    }

    return [...lastIssues, ...super.diagnose(value)];
  }
}

export function union<TTypes extends Type[]>(
  ...Types: TTypes
): UnionType<TTypes[number]> {
  return new UnionType(Types);
}

export class IntersectionType<TType extends Type> extends Type<'intersection'> {
  constructor(readonly Types: TType[]) {
    if (Types.length === 0) {
      throw new TypeError();
    }

    super();
  }

  decode<TCounterMedium extends Medium<object>>(
    medium: TCounterMedium,
    value: MediumPackedType<TCounterMedium>,
  ): __UnionToIntersection<TypeOf<TType>>;
  decode(medium: Medium, value: unknown): unknown {
    return super.decode(medium, value);
  }

  /** @internal */
  decodeUnpacked(medium: Medium, unpacked: unknown): [unknown, TypeIssue[]] {
    let partials: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let Type of this.Types) {
      let [partial, partialIssues] = Type.decodeUnpacked(medium, unpacked);

      partials.push(partial);
      issues.push(...partialIssues);
    }

    let value = merge(partials);

    issues.push(...super.diagnose(value));

    return [issues.length === 0 ? value : undefined, issues];

    function merge(partials: unknown[]): unknown {
      let pendingMergeKeyToValues: Map<string | number, unknown[]> | undefined;

      let merged = partials.reduce((merged, partial) => {
        if (merged === partial) {
          return merged;
        }

        if (typeof merged === 'object') {
          if (merged === null) {
            // merged !== partial
            throw new TypeError();
          }

          if (typeof partial !== 'object' || partial === null) {
            throw new TypeError();
          }

          for (let [key, value] of Object.entries(partial)) {
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
      });

      if (pendingMergeKeyToValues) {
        for (let [key, values] of pendingMergeKeyToValues) {
          (merged as any)[key] = merge(values);
        }
      }

      return merged;
    }
  }

  diagnose(value: unknown): TypeIssue[] {
    return [
      ...this.Types.flatMap(Type => Type.diagnose(value)),
      ...super.diagnose(value),
    ];
  }
}

export function intersection<TTypes extends Type[]>(
  ...Types: TTypes
): IntersectionType<TTypes[number]> {
  return new IntersectionType(Types);
}

export class OptionalType<TType extends Type> extends Type<'optional'> {
  constructor(readonly Type: TType) {
    super();
  }

  decode<TCounterMedium extends Medium<object>>(
    medium: TCounterMedium,
    value: MediumPackedType<TCounterMedium>,
  ): TypeOf<TType> | undefined;
  decode(medium: Medium, value: unknown): unknown {
    return super.decode(medium, value);
  }

  /** @internal */
  decodeUnpacked(medium: Medium, unpacked: unknown): [unknown, TypeIssue[]] {
    let optionalValue: unknown;
    let issues: TypeIssue[] = [];

    if (unpacked !== undefined) {
      let [value, valueIssues] = this.Type.decodeUnpacked(medium, unpacked);

      optionalValue = value;
      issues.push(...valueIssues);
    }

    issues.push(...super.diagnose(optionalValue));

    return [issues.length === 0 ? optionalValue : undefined, issues];
  }

  diagnose(value: unknown): TypeIssue[] {
    return [
      ...(value === undefined ? [] : this.Type.diagnose(value)),
      ...super.diagnose(value),
    ];
  }
}

export function optional<TType extends Type>(Type: TType): OptionalType<TType> {
  return new OptionalType(Type);
}

export type TypeOf<TType extends Type> = __TypeToMediumType<
  TType,
  XValue.Values
>;

export type TypeToMediumType<
  TType extends Type,
  TMedium extends Medium<object>,
> = TMedium extends Medium<infer TMediumTypes>
  ? TMediumTypes extends {packed: infer T}
    ? T
    : __TypeToMediumType<TType, TMediumTypes>
  : never;

type __TypeToMediumType<TType, TMediumTypes> = TType extends ObjectType<
  infer TDefinition
>
  ? __ObjectTypeDefinitionToMediumType<TDefinition, TMediumTypes>
  : TType extends ArrayType<infer TElementType>
  ? __TypeToMediumType<TElementType, TMediumTypes>[]
  : TType extends AtomicType<infer TTypeSymbol>
  ? TMediumTypes extends {[Symbol in TTypeSymbol]: infer TMediumType}
    ? TMediumType
    : never
  : TType extends UnionType<infer TElementType>
  ? __TypeToMediumType<TElementType, TMediumTypes>
  : TType extends IntersectionType<infer TElementType>
  ? __UnionToIntersection<__TypeToMediumType<TElementType, TMediumTypes>>
  : never;

type __ObjectTypeDefinitionToMediumType<TDefinition, TMediumTypes> = {
  [TKey in __KeyOfOptional<TDefinition>]?: TDefinition[TKey] extends OptionalType<
    infer TNestedType
  >
    ? __TypeToMediumType<TNestedType, TMediumTypes>
    : never;
} & {
  [TKey in __KeyOfNonOptional<TDefinition>]: __TypeToMediumType<
    TDefinition[TKey],
    TMediumTypes
  >;
};

type __KeyOfOptional<TType> = Extract<
  {
    [TKey in keyof TType]: TType[TKey] extends OptionalType<Type>
      ? TKey
      : never;
  }[keyof TType],
  string
>;

type __KeyOfNonOptional<TType> = Extract<
  {
    [TKey in keyof TType]: TType[TKey] extends OptionalType<Type>
      ? never
      : TKey;
  }[keyof TType],
  string
>;

type __UnionToIntersection<TUnion> = (
  TUnion extends unknown ? (_: TUnion) => unknown : never
) extends (_: infer TIntersection) => unknown
  ? TIntersection
  : never;
