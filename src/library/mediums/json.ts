import {atomicTypeSymbol, medium} from '../medium';

declare global {
  namespace XValue {
    interface JSONTypes {
      packed: string;
    }
  }
}

export const json = medium<XValue.JSONTypes>('JSON', {
  packing: {
    pack(data) {
      return JSON.stringify(data);
    },
    unpack(json) {
      return JSON.parse(json);
    },
  },
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
