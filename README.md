[![NPM version](https://img.shields.io/npm/v/x-value?color=%23cb3837&style=flat-square)](https://www.npmjs.com/package/x-value)
[![Repository package.json version](https://img.shields.io/github/package-json/v/vilic/x-value?color=%230969da&label=repo&style=flat-square)](./package.json)
[![Coveralls](https://img.shields.io/coveralls/github/vilic/x-value?style=flat-square)](https://coveralls.io/github/vilic/x-value)
[![MIT license](https://img.shields.io/github/license/vilic/x-value?style=flat-square)](./LICENSE)

# X-Value

X-Value (X stands for "cross") is a medium-somewhat-neutral runtime type validation library.

Comparing to alternatives like [io-ts](https://github.com/gcanti/io-ts) and [Zod](https://github.com/colinhacks/zod), X-Value uses medium/value concept and allows values to be decoded from and encoded to different mediums.

## Installation

```sh
yarn add x-value
# or
npm install x-value
```

## Usages

Defining types with X-Value is similar to io-ts/Zod.

```ts
import * as x from 'x-value';

const Oops = x.object({
  foo: x.string,
  bar: x.optional(x.number),
});

const Rock = x.record(x.string, x.number);

const Aha = x.array(Oops);

const Tick = x.tuple(x.string, x.number);

const Um = x.union(Oops, x.boolean);

const I = x.intersection(
  Oops,
  x.object({
    yoha: x.boolean,
  }),
);
```

Get static type of type object:

```ts
type Oops = x.TypeOf<typeof Oops>;
type JSONOops = x.MediumTypeOf<typeof Oops, x.JSONTypes>;
```

Refine atomic type:

```ts
const Email = x.string.refine(value => value.includes('@'));

// Or with nominal type.
const Email = x.string.refine<string & {__nominal: 'email'}>(value =>
  value.includes('@'),
);
```

Decode from medium:

```ts
let value = Oops.decode(x.json, '{"foo":"abc","bar":123}');
```

Encode to medium:

```ts
let json = Oops.decode(x.json, {foo: 'abc', bar: 123});
```

Transform from medium to medium:

```ts
let json = Oops.transform(x.queryString, x.json, 'foo=abc&bar=123');
```

Type `is` guard:

```ts
if (Oops.is(value)) {
  // ...
}
```

Type `satisfies` assertion (will throw if does not satisfy):

```ts
let oops = Oops.satisfies(value);
```

Diagnose for type issues:

```ts
let issues = Oops.diagnose(value);
```

## Mediums and Values

Mediums are what's used to store values: JSON strings, query strings, buffers etc.

For example, a string `"2022-03-31T16:00:00.000Z"` in JSON medium with type `Date` represents value `new Date('2022-03-31T16:00:00.000Z')`.

Assuming we have 3 mediums: `browser`, `server`, `rpc`; and 2 types: `ObjectId`, `Date`. Their types in mediums and value are listed below.

| Type\Medium | Browser  | RPC                | Server     | Value    |
| ----------- | -------- | ------------------ | ---------- | -------- |
| `ObjectId`  | `string` | packed as `string` | `ObjectId` | `string` |
| `Date`      | `Date`   | packed as `string` | `Date`     | `Date`   |

We can encode values to mediums:

<!-- prettier-ignore -->
```ts
let id = '6246056b1be8cbf6ca18401f';

ObjectId.encode(browser, id); // string '6246056b1be8cbf6ca18401f'
ObjectId.encode(rpc, id);     // packed string '"6246056b1be8cbf6ca18401f"'
ObjectId.encode(server, id);  // new ObjectId('6246056b1be8cbf6ca18401f')

let date = new Date('2022-03-31T16:00:00.000Z');

Date.encode(browser, date); // new Date('2022-03-31T16:00:00.000Z')
Date.encode(rpc, date);     // packed string '"2022-03-31T16:00:00.000Z"'
Date.encode(server, date);  // new Date('2022-03-31T16:00:00.000Z')
```

Or decode packed data of mediums to values:

```ts
// All result in '6246056b1be8cbf6ca18401f'
ObjectId.decode(browser, '6246056b1be8cbf6ca18401f');
ObjectId.decode(rpc, '"6246056b1be8cbf6ca18401f"');
ObjectId.decode(server, new ObjectId('6246056b1be8cbf6ca18401f'));

// All result in new Date('2022-03-31T16:00:00.000Z')
Date.decode(browser, new Date('2022-03-31T16:00:00.000Z'));
Date.decode(rpc, '"2022-03-31T16:00:00.000Z"');
Date.decode(server, new Date('2022-03-31T16:00:00.000Z'));
```

> Ideally there's no need to have "value" as a separate concept because it's essentially "ECMAScript runtime medium". But to make decode/encode easier among different mediums, "value" is promoted as an interchangeable medium.

## New Atomic Type

Before we can add medium support for a new type of atomic value, we need to add new atomic value. It is quite easy to do so:

```ts
import * as x from 'x-value';

// 1. Create a symbol for the new atomic type.
const newAtomicTypeSymbol = Symbol();

// 3. Create the new atomic type with constraint.
const NewAtomic = x.atomic(newAtomicTypeSymbol, value =>
  Buffer.isBuffer(value),
);

declare global {
  namespace XValue {
    interface Types {
      // 2. Define the symbol to value type mapping.
      [newAtomicTypeSymbol]: Buffer;
    }
  }
}
```

## New Medium

After creating the new atomic type, we need to create/extend a new medium that supports this type:

```ts
interface SuperJSONTypes extends x.JSONTypes {
  // 1. Define the unpacked type for decode/encode operation.
  [newAtomicTypeSymbol]: string;
}

const superJSON = x.json.extend<SuperJSONTypes>('Super JSON', {
  codecs: {
    // 2. Define the codec.
    [newAtomicTypeSymbol]: {
      decode(value) {
        if (typeof value !== 'string') {
          throw new TypeError(
            `Expected hex string, getting ${Object.prototype.toString.call(
              value,
            )}`,
          );
        }

        return Buffer.from(value, 'hex');
      },
      encode(value) {
        return value.toString('hex');
      },
    },
  },
});
```

## Medium Packing

When `decode()` from a medium, X-Value unpacks data for a structured input (e.g., `JSON.parse()`). It packs the data again on `encode()` (e.g., `JSON.stringify()`).

For medium that requires packing:

```ts
interface PackedTypes {
  // 1. Define the packed type.
  packed: string;
}

const packed = x.medium<PackedTypes>('Packed ', {
  // 2. Define packing methods.
  packing: {
    pack(data) {
      return JSON.stringify(data);
    },
    unpack(json) {
      return JSON.parse(json);
    },
  },
});
```

> The `superJSON` medium is actually a packed medium. However, the related definitions are inherited.

## License

MIT License.
