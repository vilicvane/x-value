import * as x from '../library';
import {constraint} from '../library';

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
  constraint(
    value instanceof globalThis.Buffer,
    `Expected instance of Buffer, getting ${toString.call(value)}.`,
  ),
);
