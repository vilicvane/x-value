import * as x from '../library';

export interface ExtendedJSONTypes extends XValue.JSONTypes {
  [x.dateTypeSymbol]: string;
}

export const extendedJSON = x.json.extend<ExtendedJSONTypes>('Extended JSON', {
  codecs: {
    [x.dateTypeSymbol]: {
      encode(date) {
        return date.toISOString();
      },
      decode(date) {
        return new Date(date);
      },
    },
  },
});
