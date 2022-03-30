import * as x from '../library';
import {mediumAtomicSymbol} from '../library';

declare global {
  namespace XValue {
    interface Values {
      [xObjectIdSymbol]: ArrayBuffer;
    }
  }
}

interface JSONMediumTypes {
  packed: string;
  [x.DateSymbol]: string;
}

interface ECMAScriptMediumTypes {
  [x.undefinedSymbol]: undefined;
  [x.stringSymbol]: string;
  [x.numberSymbol]: number;
  [x.DateSymbol]: Date;
}

const xObjectIdSymbol = Symbol();
const xObjectId = x.atomic(xObjectIdSymbol, () => true);

interface NodeJSMediumTypes extends ECMAScriptMediumTypes {
  [xObjectIdSymbol]: ArrayBuffer;
}

interface BrowserMediumTypes extends ECMAScriptMediumTypes {
  [xObjectIdSymbol]: string;
}

interface QueryMediumTypes {
  packed: string;
}

const json = x.medium<JSONMediumTypes>('JSON', {
  packing: {
    pack(data) {
      return JSON.stringify(data);
    },
    unpack(json) {
      return JSON.parse(json);
    },
  },
  codecs: {
    [x.DateSymbol]: {
      encode(value) {
        return value.toISOString();
      },
      decode(value) {
        return new Date(value);
      },
    },
    [x.mediumAtomicSymbol]: {
      encode(value) {
        return value;
      },
      decode(value) {
        return value;
      },
    },
  },
});

const ecmascript = x.medium<ECMAScriptMediumTypes>('ECMAScript', {
  codecs: {
    [mediumAtomicSymbol]: {
      encode(value) {
        return value;
      },
      decode(value) {
        return value;
      },
    },
  },
});

// const bson = x.medium<BSONMediumTypes, ArrayBuffer>('BSON');
// const query = x.medium<QueryMediumTypes, string>('Query');

// const ecmascript = x.medium<ECMAScriptMediumTypes, unknown>('ECMAScript');

// const node = ecmascript.extend<NodeJSMediumTypes>('Node.js');

// const browser = ecmascript.extend<BrowserMediumTypes>('Browser');

const email = x.string.refine<string & {__nominal: 'email'}>(value =>
  /@/.test(value) ? true : 'Not an email',
);

const A = x.object({
  x: x.optional(
    x.object({
      yy: x.number,
    }),
  ),
});

const B = x.object({
  x: x.object({
    xx: x.number,
  }),
});

const C = x.intersection(A, B);

const Params = x.object({
  id: x.union(xObjectId, x.undefined),
  foo: x.optional(email),
  bar: x.array(x.number),
  date: x.union(x.Date),
  c: C,
});

let ppp = Params.decode(
  json,
  JSON.stringify({
    id: '507f1f77bcf86cd799439011',
    foo: '123@',
    bar: [1, 2],
    date: new Date().toISOString(),
    c: {
      x: {
        yy: 11,
        xx: 2,
      },
      extra: 3,
    },
  }),
);

console.log(ppp);
console.log(ppp.date.toLocaleDateString());

// let {id, foo, bar, date, c} = ppp;

// let pp = Params.decode(query, 'foo=123&bar=456').value;

// let jsonString = Params.decode(query, 'foo=123&bar=456').to(json);
// let queryString = Params.decode(query, 'foo=123&bar=456').to(query);

// ecmascript.codec({
//   [x.mediumObjectSymbol]: {
//     // encode() {},
//     decode(current, ObjectType, unpacked) {
//       if (typeof current !== 'undefined' || current === null) {
//         throw new TypeError();
//       }

//       return Object.fromEntries(
//         Object.entries(ObjectType.definition).map(([key, Type]) => [
//           key,
//           Type.decodeUnpacked(ecmascript, unpacked, {current: current![key]}),
//         ]),
//       );
//     },
//   },
//   [x.numberSymbol]: {
//     encode(value) {
//       return value;
//     },
//     decode(value) {
//       return value;
//     },
//   },
// });

// query.codec({
//   [x.mediumPackingSymbol]: {
//     unpack(query) {
//       return QueryString.parse(query);
//     },
//     pack(dict) {
//       return QueryString.stringify(dict);
//     },
//   },
//   [x.mediumObjectSymbol]: {
//     // encode() {},
//     decode(ObjectType, unpacked) {
//       return Object.fromEntries(
//         Object.entries(ObjectType.definition).map(([key, Type]) => [
//           key,
//           Type.decodeUnpacked(query, unpacked, unpacked[key]),
//         ]),
//       );
//     },
//   },
//   // [xUInt32Symbol]: {
//   //   encode(value, Type) {
//   //     return value;
//   //   },
//   //   decode(value, Type) {
//   //     // uint32
//   //     return value;
//   //   },
//   // },
// });

// bson.codec({
//   encode() {},
//   decode(query, Type) {
//     let data = parse(query);
//   },
// });
