import type {
  __ElementOrArray,
  __MediumTypeOf,
  __MediumTypeOfRecordKeyType,
  __MediumTypesPackedType,
  __RefinedType,
  __TypeOfRecordKeyType,
} from '../@utils';
import {__ObjectTypeDefinitionToMediumType, toString} from '../@utils';
import type {Medium} from '../medium';

import type {TypeConstraint, TypeIssue, TypeOf, TypePath} from './type';
import {Type} from './type';

export interface RecordType<TKey, TValue> {
  refine<TNominalOrRefined, TNominal = unknown>(
    constraints: __ElementOrArray<
      TypeConstraint<Record<__TypeOfRecordKeyType<TKey>, TypeOf<TValue>>>
    >,
  ): __RefinedType<this, TNominalOrRefined, TNominal>;

  decode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    packed: __MediumTypesPackedType<
      TMediumTypes,
      Record<
        __MediumTypeOfRecordKeyType<TKey, TMediumTypes>,
        __MediumTypeOf<TValue, TMediumTypes>
      >
    >,
  ): Record<__TypeOfRecordKeyType<TKey>, TypeOf<TValue>>;

  encode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: Record<__TypeOfRecordKeyType<TKey>, TypeOf<TValue>>,
  ): __MediumTypesPackedType<
    TMediumTypes,
    Record<
      __MediumTypeOfRecordKeyType<TKey, TMediumTypes>,
      __MediumTypeOf<TValue, TMediumTypes>
    >
  >;

  transform<TFromMediumTypes extends object, TToMediumTypes extends object>(
    from: Medium<TFromMediumTypes>,
    to: Medium<TToMediumTypes>,
    packed: __MediumTypesPackedType<
      TFromMediumTypes,
      Record<
        __MediumTypeOfRecordKeyType<TKey, TFromMediumTypes>,
        __MediumTypeOf<TValue, TFromMediumTypes>
      >
    >,
  ): __MediumTypesPackedType<
    TToMediumTypes,
    Record<
      __MediumTypeOfRecordKeyType<TKey, TToMediumTypes>,
      __MediumTypeOf<TValue, TToMediumTypes>
    >
  >;

  is(
    value: unknown,
  ): value is Record<__TypeOfRecordKeyType<TKey>, TypeOf<TValue>>;
}

export class RecordType<
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TKey extends Type,
  TValue extends Type,
> extends Type<'record'> {
  constructor(readonly Key: TKey, readonly Value: TValue) {
    super();
  }

  /** @internal */
  _decode(
    medium: Medium,
    unpacked: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]] {
    // TODO: implicit conversion to object?

    if (typeof unpacked !== 'object' || unpacked === null) {
      return [
        undefined,
        [
          {
            path,
            message: `Expecting unpacked value to be a non-null object, getting ${toString.call(
              unpacked,
            )}.`,
          },
        ],
      ];
    }

    let Key = this.Key;
    let Value = this.Value;

    let entries: [string | number, unknown][] = [];
    let issues: TypeIssue[] = [];

    for (let [key, unpackedValue] of getRecordEntries(unpacked)) {
      let [value, valueIssues] = Value._decode(medium, unpackedValue, [
        ...path,
        key,
      ]);

      entries.push([key, value]);
      issues.push(...Key._diagnose(key, [...path, {key}]), ...valueIssues);
    }

    return [
      issues.length === 0 ? buildRecord(entries, unpacked) : undefined,
      issues,
    ];
  }

  /** @internal */
  _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
    diagnose: boolean,
  ): [unknown, TypeIssue[]] {
    if (diagnose && (typeof value !== 'object' || value === null)) {
      return [
        undefined,
        [
          {
            path,
            message: `Expecting value to be a non-null object, getting ${toString.call(
              value,
            )}.`,
          },
        ],
      ];
    }

    let Key = this.Key;
    let Value = this.Value;

    let entries: [string | number, unknown][] = [];
    let issues: TypeIssue[] = [];

    for (let [key, nestedValue] of getRecordEntries(value as object)) {
      let [unpacked, valueIssues] = Value._encode(
        medium,
        nestedValue,
        [...path, key],
        diagnose,
      );

      entries.push([key, unpacked]);
      issues.push(...Key._diagnose(key, [...path, {key}]), ...valueIssues);
    }

    return [
      issues.length === 0 ? buildRecord(entries, value as object) : undefined,
      issues,
    ];
  }

  /** @internal */
  _transform(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]] {
    if (typeof unpacked !== 'object' || unpacked === null) {
      return [
        undefined,
        [
          {
            path,
            message: `Expecting unpacked value to be a non-null object, getting ${toString.call(
              unpacked,
            )}.`,
          },
        ],
      ];
    }

    let Key = this.Key;
    let Value = this.Value;

    let entries: [string | number, unknown][] = [];
    let issues: TypeIssue[] = [];

    for (let [key, unpackedValue] of getRecordEntries(unpacked)) {
      let [transformedUnpacked, valueIssues] = Value._transform(
        from,
        to,
        unpackedValue,
        [...path, key],
      );

      entries.push([key, transformedUnpacked]);
      issues.push(...Key._diagnose(key, [...path, {key}]), ...valueIssues);
    }

    return [
      issues.length === 0 ? buildRecord(entries, unpacked) : undefined,
      issues,
    ];
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath): TypeIssue[] {
    if (typeof value !== 'object' || value === null) {
      return [
        {
          path,
          message: `Expecting a non-null object, getting ${toString.call(
            value,
          )}.`,
        },
      ];
    }

    let Key = this.Key;
    let Value = this.Value;

    return getRecordEntries(value).flatMap(([key, nestedValue]) => [
      ...Key._diagnose(key, [...path, {key}]),
      ...Value._diagnose(nestedValue, [...path, key]),
    ]);
  }
}

export function record<TKey extends Type, TValue extends Type>(
  Key: TKey,
  Value: TValue,
): RecordType<TKey, TValue> {
  return new RecordType(Key, Value);
}

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
    let array: unknown[] = [];

    for (let [index, value] of entries) {
      array[index as number] = value;
    }

    return array;
  } else {
    return Object.fromEntries(entries);
  }
}
