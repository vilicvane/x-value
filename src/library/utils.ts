import type {TypeInMediumsPartial, __type_in_mediums} from './core';

export type MediumTypeOf<
  TMediumName extends XValue.UsingName,
  TType extends TypeInMediumsPartial,
> = TType[__type_in_mediums][TMediumName];

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
  refined: T,
  message?: string | (() => string),
): T {
  if (!condition) {
    if (typeof message === 'function') {
      message = message();
    }

    throw message ?? 'Unexpected value.';
  }

  return refined;
}
