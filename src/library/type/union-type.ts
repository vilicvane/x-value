import {__MediumTypeOf} from '../@utils';
import {Medium, MediumTypesPackedType} from '../medium';

import {Type, TypeIssue, TypeOf, TypePath} from './type';

export interface UnionType<TType> {
  decode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    packed: MediumTypesPackedType<
      TMediumTypes,
      __MediumTypeOf<TType, TMediumTypes, true>
    >,
  ): TypeOf<TType>;

  encode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: TypeOf<TType>,
  ): MediumTypesPackedType<
    TMediumTypes,
    __MediumTypeOf<TType, TMediumTypes, true>
  >;

  convert<TFromMediumTypes extends object, TToMediumTypes extends object>(
    from: Medium<TFromMediumTypes>,
    to: Medium<TToMediumTypes>,
    packed: MediumTypesPackedType<
      TFromMediumTypes,
      __MediumTypeOf<TType, TFromMediumTypes, true>
    >,
  ): MediumTypesPackedType<
    TToMediumTypes,
    __MediumTypeOf<TType, TToMediumTypes, true>
  >;

  is(value: unknown): value is TypeOf<TType>;
}

export class UnionType<TType extends Type> extends Type<'union'> {
  constructor(readonly Types: TType[]) {
    if (Types.length === 0) {
      throw new TypeError();
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

    for (let Type of this.Types) {
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
  ): [unknown, TypeIssue[]] {
    let lastIssues!: TypeIssue[];

    for (let Type of this.Types) {
      let [unpacked, issues] = Type._encode(medium, value, path);

      if (issues.length === 0) {
        return [unpacked, issues];
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
  _convert(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]] {
    let lastIssues!: TypeIssue[];

    for (let Type of this.Types) {
      let [convertedUnpacked, issues] = Type._convert(from, to, unpacked, path);

      if (issues.length === 0) {
        return [convertedUnpacked, issues];
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

    for (let Type of this.Types) {
      let issues = Type._diagnose(value, path);

      lastIssues = issues;

      if (issues.length === 0) {
        return issues;
      }
    }

    return lastIssues;
  }
}

export function union<TTypes extends Type[]>(
  ...Types: TTypes
): UnionType<TTypes[number]> {
  return new UnionType(Types);
}
