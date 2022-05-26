import * as x from '../library';

declare global {
  namespace XValue {
    interface Types {
      [bufferTypeSymbol]: Buffer;
    }
  }
}

const toString = Object.prototype.toString;

export const bufferTypeSymbol = Symbol();
export const Buffer = x.atomic(bufferTypeSymbol, value =>
  value instanceof globalThis.Buffer
    ? true
    : `Expected instance of Buffer, getting ${toString.call(value)}.`,
);
