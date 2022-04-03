import {
  __MediumTypeOf,
  __ObjectTypeDefinitionToMediumType,
  toString,
} from '../@utils';
import {Medium, MediumTypesPackedType} from '../medium';
import {numberTypeSymbol, stringTypeSymbol} from '../types';

import {AtomicType} from './atomic-type';
import {Type, TypeIssue, TypeOf, TypePath} from './type';

export interface RecordType<TKey, TValue> {
  decode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    packed: MediumTypesPackedType<
      TMediumTypes,
      Record<TypeOf<TKey>, __MediumTypeOf<TValue, TMediumTypes, true>>
    >,
  ): Record<TypeOf<TKey>, TypeOf<TValue>>;

  encode<TMediumTypes extends object>(
    medium: Medium<TMediumTypes>,
    value: Record<TypeOf<TKey>, TypeOf<TValue>>,
  ): MediumTypesPackedType<
    TMediumTypes,
    Record<TypeOf<TKey>, __MediumTypeOf<TValue, TMediumTypes, true>>
  >;

  transform<TFromMediumTypes extends object, TToMediumTypes extends object>(
    from: Medium<TFromMediumTypes>,
    to: Medium<TToMediumTypes>,
    packed: MediumTypesPackedType<
      TFromMediumTypes,
      Record<TypeOf<TKey>, __MediumTypeOf<TValue, TFromMediumTypes, true>>
    >,
  ): MediumTypesPackedType<
    TToMediumTypes,
    Record<TypeOf<TKey>, __MediumTypeOf<TValue, TToMediumTypes, true>>
  >;

  is(value: unknown): value is TypeOf<TValue>;
}

export class RecordType<
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TKey extends AtomicType<
    unknown,
    typeof stringTypeSymbol | typeof numberTypeSymbol
  >,
  TValue extends Type,
> extends Type<'record'> {
  constructor(
    readonly Key: AtomicType<
      unknown,
      typeof stringTypeSymbol | typeof numberTypeSymbol
    >,
    readonly Value: TValue,
  ) {
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
  ): [unknown, TypeIssue[]] {
    if (typeof value !== 'object' || value === null) {
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

    for (let [key, nestedValue] of getRecordEntries(value)) {
      let [unpacked, valueIssues] = Value._encode(medium, nestedValue, [
        ...path,
        key,
      ]);

      entries.push([key, unpacked]);
      issues.push(...Key._diagnose(key, [...path, {key}]), ...valueIssues);
    }

    return [
      issues.length === 0 ? buildRecord(entries, value) : undefined,
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

export function record<
  TKey extends AtomicType<
    unknown,
    typeof stringTypeSymbol | typeof numberTypeSymbol
  >,
  TValue extends Type,
>(Key: TKey, Value: TValue): RecordType<TKey, TValue> {
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
