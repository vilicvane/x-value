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
        if (typeof date !== 'string') {
          throw new TypeError('Invalid date value');
        }

        let value = new Date(date);

        if (isNaN(value.getTime())) {
          throw new TypeError('Invalid date value');
        }

        return value;
      },
    },
  },
});
