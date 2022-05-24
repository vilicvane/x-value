import {toString} from '../@internal';
import type {Medium} from '../medium';

import type {TypeIssue, TypePath} from './type';
import {Type} from './type';

export class RecordType<
  TKeyType extends Type,
  TValueType extends Type,
> extends Type<__RecordInMediums<TKeyType, TValueType>> {
  protected __type!: 'record';

  constructor(readonly Key: TKeyType, readonly Value: TValueType) {
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

export function record<TKeyType extends Type, TValueType extends Type>(
  Key: TKeyType,
  Value: TValueType,
): RecordType<TKeyType, TValueType> {
  return new RecordType(Key, Value);
}

type __RecordInMediums<TKeyType extends Type, TValueType extends Type> = {
  [TMediumName in keyof XValue.Using]: Record<
    TKeyType extends Type<infer TKeyInMediums>
      ? Extract<TKeyInMediums[TMediumName], string | symbol>
      : never,
    TValueType extends Type<infer TValueInMediums>
      ? TValueInMediums[TMediumName]
      : never
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
    let array: unknown[] = [];

    for (let [index, value] of entries) {
      array[index as number] = value;
    }

    return array;
  } else {
    return Object.fromEntries(entries);
  }
}
