import * as x from '../library';
import {constraint} from '../library';

const toString = Object.prototype.toString;

declare global {
  namespace XValue {
    interface Types {
      [bufferTypeSymbol]: Buffer;
    }
  }
}

export const bufferTypeSymbol = Symbol();
export const Buffer = x.atomic(bufferTypeSymbol, value =>
  constraint(
    value instanceof globalThis.Buffer,
    `Expected instance of Buffer, getting ${toString.call(value)}.`,
  ),
);
