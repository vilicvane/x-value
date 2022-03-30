import {dateTypeSymbol, json} from '../library';

export interface ExtendedJSONTypes extends XValue.JSONTypes {
  [dateTypeSymbol]: string;
}

export const extendedJSON = json.extend<ExtendedJSONTypes>('Extended JSON', {
  codecs: {
    [dateTypeSymbol]: {
      encode(date) {
        return date.toISOString();
      },
      decode(date) {
        return new Date(date);
      },
    },
  },
});
