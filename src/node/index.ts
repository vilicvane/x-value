import * as x from 'x-value';

const toString = Object.prototype.toString;

const BufferClass = globalThis.Buffer;

declare global {
  namespace XValue {
    interface Types {
      [bufferTypeSymbol]: Buffer;
    }
  }
}

export const bufferTypeSymbol = Symbol();
export const Buffer = x.atomic(bufferTypeSymbol, value =>
  x.constraint(
    value instanceof BufferClass,
    `Expected instance of Buffer, getting ${toString.call(value)}.`,
  ),
);
