import * as x from 'x-value';

const toString = Object.prototype.toString;

const BufferClass = globalThis.Buffer;

declare global {
  namespace XValue {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Types {
      [bufferTypeSymbol]: Buffer;
    }
  }
}

export const bufferTypeSymbol = Symbol();

export const Buffer = x.atomic(bufferTypeSymbol, value =>
  x.constraint(
    value instanceof BufferClass,
    `Expected instance of Buffer, got ${toString.call(value)}.`,
  ),
);
