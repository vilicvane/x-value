import {atomicTypeSymbol, medium} from '../medium';
import {
  booleanTypeSymbol,
  nullTypeSymbol,
  numberTypeSymbol,
  stringTypeSymbol,
} from '../types';

declare global {
  namespace XValue {
    interface JSONValueTypes {
      [nullTypeSymbol]: null;
      [stringTypeSymbol]: string;
      [numberTypeSymbol]: number;
      [booleanTypeSymbol]: boolean;
    }
  }
}

export const jsonValue = medium<XValue.JSONValueTypes>('JSON Value', {
  codecs: {
    [atomicTypeSymbol]: {
      encode(value) {
        return value;
      },
      decode(value) {
        return value;
      },
    },
  },
});
