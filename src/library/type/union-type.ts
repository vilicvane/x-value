import type {
  __ElementOrArray,
  __MediumTypeOf,
  __MediumTypesPackedType,
  __RefinedType,
} from '../@internal';
import type {Medium} from '../medium';

import type {TypeConstraint, TypeIssue, TypeOf, TypePath} from './type';
import {Type} from './type';

export interface UnionType<TTypeTuple> {
  refine<TNominalOrRefinement, TNominal = unknown>(
    constraints: __ElementOrArray<TypeConstraint<TypeOf<TTypeTuple[number]>>>,
  ): __RefinedType<this, TNominalOrRefinement, TNominal>;

  decode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    packed: __MediumTypesPackedType<
      TMediumTypes,
      __MediumTypeOf<TTypeTuple[number], TMediumTypes>
    >,
  ): TypeOf<TTypeTuple[number]>;

  encode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: TypeOf<TTypeTuple[number]>,
  ): __MediumTypesPackedType<
    TMediumTypes,
    __MediumTypeOf<TTypeTuple[number], TMediumTypes>
  >;

  transform<TFromMediumTypes extends object, TToMediumTypes extends object>(
    from: Medium<TFromMediumTypes>,
    to: Medium<TToMediumTypes>,
    packed: __MediumTypesPackedType<
      TFromMediumTypes,
      __MediumTypeOf<TTypeTuple[number], TFromMediumTypes>
    >,
  ): __MediumTypesPackedType<
    TToMediumTypes,
    __MediumTypeOf<TTypeTuple[number], TToMediumTypes>
  >;

  is(value: unknown): value is TypeOf<TTypeTuple[number]>;
}

export class UnionType<TTypeTuple extends Type[]> extends Type<'union'> {
  constructor(readonly TypeTuple: TTypeTuple) {
    if (TypeTuple.length < 2) {
      throw new TypeError('Expecting at least 2 type for union type');
    }

    super();
  }

  /** @internal */
  _decode(
    medium: Medium,
    unpacked: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]] {
    let lastIssues!: TypeIssue[];

    for (let Type of this.TypeTuple) {
      let [value, issues] = Type._decode(medium, unpacked, path);

      if (issues.length === 0) {
        return [value, issues];
      }

      lastIssues = issues;
    }

    return [
      undefined,
      [
        {
          path,
          message:
            'The unpacked value satisfies none of the type in the union type.',
        },
        ...lastIssues,
      ],
    ];
  }

  /** @internal */
  _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
    diagnose: boolean,
  ): [unknown, TypeIssue[]] {
    let lastIssues!: TypeIssue[];

    for (let Type of this.TypeTuple) {
      let [unpacked, issues] = Type._encode(medium, value, path, diagnose);

      if (issues.length === 0) {
        return [unpacked, issues];
      }

      lastIssues = issues;
    }

    // If diagnose is `false`, it will never reach here.

    return [
      undefined,
      [
        {
          path,
          message:
            'The unpacked value satisfies none of the type in the union type.',
        },
        ...lastIssues,
      ],
    ];
  }

  /** @internal */
  _transform(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]] {
    let lastIssues!: TypeIssue[];

    for (let Type of this.TypeTuple) {
      let [transformedUnpacked, issues] = Type._transform(
        from,
        to,
        unpacked,
        path,
      );

      if (issues.length === 0) {
        return [transformedUnpacked, issues];
      }

      lastIssues = issues;
    }

    return [
      undefined,
      [
        {
          path,
          message:
            'The unpacked value satisfies none of the type in the union type.',
        },
        ...lastIssues,
      ],
    ];
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath): TypeIssue[] {
    let lastIssues!: TypeIssue[];

    for (let Type of this.TypeTuple) {
      let issues = Type._diagnose(value, path);

      lastIssues = issues;

      if (issues.length === 0) {
        return issues;
      }
    }

    return lastIssues;
  }
}

export function union<TTypeTuple extends [Type, Type, ...Type[]]>(
  ...Types: TTypeTuple
): UnionType<TTypeTuple> {
  return new UnionType(Types);
}
