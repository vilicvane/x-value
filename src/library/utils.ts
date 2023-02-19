import type {
  MediumType,
  Type,
  TypeInMediumsPartial,
  __type_in_mediums,
} from './core';

export type MediumTypeOf<
  TMediumName extends XValue.UsingName,
  TType extends TypeInMediumsPartial,
> = TType[__type_in_mediums][TMediumName];

export type XTypeOfValue<T> = Type<
  Record<'value', T> & Record<XValue.UsingName, unknown>
>;

export type XTypeOfMediumValue<
  TMediumName extends XValue.UsingName,
  T,
> = MediumType<Record<TMediumName, T> & Record<XValue.UsingName, unknown>>;

export function constraint(
  condition: boolean,
  message?: string | (() => string),
): void {
  if (!condition) {
    if (typeof message === 'function') {
      message = message();
    }

    throw message ?? 'Unexpected value.';
  }
}

export function refinement<T, TRefined extends T>(
  condition: boolean,
  refined: T,
  message?: string | (() => string),
): TRefined {
  if (!condition) {
    if (typeof message === 'function') {
      message = message();
    }

    throw message ?? 'Unexpected value.';
  }

  return refined as TRefined;
}
