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
