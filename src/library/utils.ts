import type {Type, TypeInMediumsPartial, __type_in_mediums} from './core';

export type MediumTypeOf<
  TMediumName extends XValue.UsingName,
  TType extends TypeInMediumsPartial,
> = TType[__type_in_mediums][TMediumName];

export type XTypeOfValue<T> = Type<
  Record<'value', T> & Record<XValue.UsingName, unknown>,
  true
>;

export type XTypeOfMediumValue<TMediumName extends XValue.UsingName, T> = Type<
  Record<TMediumName, T> & Record<XValue.UsingName, unknown>,
  true
>;

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

export function refinement<T>(
  condition: boolean,
  refined: T extends Function ? () => T : (() => T) | T,
  message?: string | (() => string),
): T {
  if (!condition) {
    if (typeof message === 'function') {
      message = message();
    }

    throw message ?? 'Unexpected value.';
  }

  return typeof refined === 'function' ? refined() : refined;
}
