[![NPM version](https://img.shields.io/npm/v/x-value?color=%23cb3837&style=flat-square)](https://www.npmjs.com/package/x-value)
[![Repository package.json version](https://img.shields.io/github/package-json/v/vilic/x-value?color=%230969da&label=repo&style=flat-square)](./package.json)
[![Coveralls](https://img.shields.io/coveralls/github/vilic/x-value?style=flat-square)](https://coveralls.io/github/vilic/x-value)
[![MIT license](https://img.shields.io/github/license/vilic/x-value?style=flat-square)](./LICENSE)

# X-Value <!-- omit in toc -->

X-Value (X stands for "cross") is a **medium**-somewhat-**neutral** runtime type validation library.

Comparing to alternatives like [io-ts](https://github.com/gcanti/io-ts) and [Zod](https://github.com/colinhacks/zod), X-Value uses medium/value concept and allows values to be decoded from and encoded to different mediums.

## Table of Contents <!-- omit in toc -->

- [Installation](#installation)
- [Quick Start](#quick-start)
  - [Runtime Type Validation](#runtime-type-validation)
  - [JSON Schema](#json-schema)
  - [Multi-medium Usages](#multi-medium-usages)
- [Types](#types)
  - [Atomic Type](#atomic-type)
    - [Built-in Atomic Types](#built-in-atomic-types)
  - [Object Type](#object-type)
  - [Record Type](#record-type)
  - [Array Type](#array-type)
  - [Tuple Type](#tuple-type)
  - [Union Type](#union-type)
  - [Intersection Type](#intersection-type)
  - [Recursive Type](#recursive-type)
  - [Function Type](#function-type)
  - [Refined Type](#refined-type)
  - [Nominal Type](#nominal-type)
  - [Exact Type](#exact-type)
- [Type Usages](#type-usages)
  - [Decode from Medium](#decode-from-medium)
  - [Encode to Medium](#encode-to-medium)
  - [Transform from Medium to Medium](#transform-from-medium-to-medium)
  - [Type Guards](#type-guards)
  - [Type Diagnostics](#type-diagnostics)
  - [Static Type](#static-type)
  - [JSON Schema](#json-schema-1)
- [Medium](#medium)
  - [Built-in Mediums](#built-in-mediums)
  - [New Medium](#new-medium)
- [Medium Packing](#medium-packing)
- [Mediums and Values](#mediums-and-values)
- [License](#license)

## Installation

```sh
npm install x-value
```

## Quick Start

### Runtime Type Validation

```ts
import * as x from 'x-value';

// Define X-Type.
const Payload = x.object({
  date: x.Date,
  limit: x.number.optional(),
});

// Get static type of Payload.
type Payload = x.TypeOf<typeof Payload>;

// Returns true if payload is a valid value of Payload.
const valid = Payload.is({});

// Returns an array of issues if payload is not a valid value of Payload, empty
// if valid.
const issues = Payload.diagnose({});

// Returns valid value as-is, throws if invalid.
const value = Payload.satisfies({});

// Asserts payload, throws if invalid.
Payload.asserts({});
```

### JSON Schema

```ts
import * as x from 'x-value';

const Config = x
  .object({
    build: x.union([x.literal('debug'), x.literal('release')]).nominal({
      description: "Build type, 'debug' for debug and 'release' for release.",
    }),
    port: x
      .integerRange({min: 1, max: 65535})
      .nominal({
        description: 'Port to listen.',
      })
      .optional(),
  })
  .exact();

// JSON schema (object).
const jsonSchema = Config.toJSONSchema();
```

### Multi-medium Usages

```ts
import * as x from 'x-value';

declare global {
  namespace XValue {
    /**
     * X-Value caches static types to improve compilation performance. To avoid
     * unnecessary overhead, we need explicit declarations of mediums being
     * used.
     *
     * In this example, we use "extended-json-value" and "extended-query-string"
     * mediums.
     */
    interface Using
      extends x.UsingExtendedJSONValue,
        x.UsingExtendedQueryString {}
  }
}

const Payload = x.object({
  date: x.Date,
  limit: x.number,
});

// Decode from "extended-json-value", with which `Date` is encoded as string.
Payload.decode(x.extendedJSONValue, {
  date: '1970-01-01T00:00:00.000Z',
  limit: 10,
});

// Decode from "extended-query-string", with which both `Date` and `number` are
// encoded as string and then "packed" together as a string.
Payload.decode(x.extendedQueryString, 'date=1970-01-01T00:00:00.000Z&limit=10');
```

## Types

### Atomic Type

Atomic types are elementary types that build other types.

To define an atomic type, a symbol to decoded type mapping is also required:

```ts
declare global {
  namespace XValue {
    /**
     * `XValue.Types` is an interface that maps atomic type symbol to the
     * correspondent type in decoded value.
     */
    interface Types {
      [stringTypeSymbol]: string;
    }
  }
}

export const stringTypeSymbol = Symbol();

export const string = x.atomic(stringTypeSymbol, value =>
  // `x.constraint` is a helper function that throws on false condition.
  x.constraint(typeof value === 'string'),
);
```

> The symbol to type mapping is also required for mediums that supports this atomic type.

#### Built-in Atomic Types

- `x.never`
- `x.unknown`
- `x.undefined`
- `x.void`
- `x.null`
- `x.string`
- `x.number`
- `x.bigint`
- `x.boolean`
- `x.Function`
- `x.Date`
- `x.RegExp`

### Object Type

```ts
const ObjectType = x.object({
  foo: x.string,
  bar: x.number.optional(),
});

type ObjectType = x.TypeOf<typeof ObjectType>; // {foo: string; bar?: number}
```

> The return value of `.optional()` is an instance of `TypeLike` instead of `Type`.

To extend an object type:

```ts
const ExtendedObjectType = ObjectType.extend({
  extra: x.boolean,
});
```

### Record Type

```ts
const RecordType = x.record(x.string, x.number);

type RecordType = x.TypeOf<typeof RecordType>; // {[key: string]: number}
```

### Array Type

```ts
const ArrayType = x.array(x.string);

type ArrayType = x.TypeOf<typeof ArrayType>; // string[]
```

### Tuple Type

```ts
const TupleType = x.tuple([x.string, x.number]);

type TupleType = x.TypeOf<typeof TupleType>; // [string, number]
```

### Union Type

```ts
const UnionType = x.union([x.boolean, x.undefined]);

type UnionType = x.TypeOf<typeof UnionType>; // boolean | undefined
```

> At least two types are required for union type.

### Intersection Type

```ts
const IntersectionType = x.intersection([
  x.object({
    foo: x.string,
  }),
  x.object({
    bar: x.number.optional(),
  }),
]);

type IntersectionType = x.TypeOf<typeof IntersectionType>; // {foo: string; bar?: number}
```

> At least two types are required for intersection type.

### Recursive Type

Recursive type requires a hand-written definition:

```ts
/**
 * This is required for recursive type to work.
 */
interface RecursiveTypeDefinition {
  // Use `typeof x.Date` to make sure it works with different mediums.
  date: typeof x.Date;
  next?: RecursiveTypeDefinition;
}

const RecursiveType = x.recursive<RecursiveTypeDefinition>(RecursiveType =>
  x.object({
    date: x.Date,
    next: RecursiveType.optional(),
  }),
);

type RecursiveType = x.TypeOf<typeof RecursiveType>;
```

However, you don't have to write the whole declaration separately for type that contains recursive part:

```ts
const NonRecursivePart = x.object({
  date: x.Date,
});

// Use `x.Recursive<>` to build recursive type definition.
type RecursiveTypeDefinition = x.Recursive<
  {
    next?: RecursiveTypeDefinition;
  },
  typeof NonRecursivePart
>;

const RecursiveType = x.recursive<RecursiveTypeDefinition>(RecursiveType =>
  NonRecursivePart.extend({
    next: RecursiveType.optional(),
  }),
);

type RecursiveType = x.TypeOf<typeof RecursiveType>;
```

> The hand-written `RecursiveTypeDefinition` is completely different from the one built by `x.Recursive<>`, you may choose what fits your needs more.

### Function Type

```ts
const FunctionType = x.function([x.string], x.number);

type FunctionType = x.TypeOf<typeof FunctionType>; // (arg_0: string) => number
```

It important to understand function type validates **neither** the function parameters **nor** the return value.

However, you may create guarded functions using function type:

```ts
const fn = FunctionType.guard(value => value.length);
```

> Please note that `x.Function` is not a function type, instead it's a pre-defined, non-generic atomic type that matches all functions.

### Refined Type

```ts
const RefinedType = x.string.refined(value =>
  // `x.refinement` is a helper function that returns the refined value on true
  // condition while throws on false condition.
  x.refinement(value.includes('@'), value),
);
```

`Type.refined()` accepts two generic type parameters: `TNominalKey` and `TRefinement`.

- `TNominalKey` is a string or symbol that identifies the type, use `never` if you don't want to specify that.
- `TRefinement` is the type refinement that will eventually be used to intersect with the original one (`T & TRefinement`).

E.g.:

```ts
// No nominal key but refinement on type:
const RefinedType = x.string.refined<never, `${string}@${string}`>(value =>
  x.refinement(value.includes('@'), value),
);

// Nominal key but no refinement on type:
const RefinedType = x.string.refined<'email'>(value =>
  x.refinement(value.includes('@'), value),
);
```

We can also change the refined value by returning a different one:

```ts
const TrimmedString = x.string.refined(value => value.trim());
```

> The refine process happens during both encode/decode phases, and is supposed to be a stable process. Which means that refining against an already-refined value should return an identical one.

### Nominal Type

Nominal type is just [refined type](#refined-type) with only nominal key and no refinements:

```ts
const RefinedType = x.string.nominal<'email'>(); // x.string.refined<'email'>([])
```

### Exact Type

X-Value by default parses only known properties. However, the extra properties are ignored without throwing errors.

To make sure type guards and assertions work as expected, you may use `Type.exact()` if needed.

```ts
const ExactType = x
  .object({
    // exact: true
    foo: x.object({
      // exact: inherited true
      bar: x
        .object({
          // exact: false
          pia: x.string,
        })
        .exact(false),
    }),
  })
  .exact();
```

> `Type.exact()` will be inherited unless explicitly `.exact(false)`.

## Type Usages

### Decode from Medium

```ts
declare global {
  namespace XValue {
    interface Using extends x.UsingJSON {}
  }
}

const Data = x.object({
  foo: x.string,
  bar: x.number,
});

Data.decode(x.json, '{"foo":"abc","bar":123}'); // {foo: 'abc', bar: 123}
```

### Encode to Medium

```ts
declare global {
  namespace XValue {
    interface Using extends x.UsingJSON {}
  }
}

const Data = x.object({
  foo: x.string,
  bar: x.number,
});

Data.encode(x.json, {foo: 'abc', bar: 123}); // '{"foo":"abc","bar":123}'
```

### Transform from Medium to Medium

```ts
declare global {
  namespace XValue {
    interface Using extends x.UsingJSON, x.UsingQueryString {}
  }
}

const Data = x.object({
  foo: x.string,
  bar: x.number,
});

Data.transform(x.queryString, x.json, 'foo=abc&bar=123'); // '{"foo":"abc","bar":123}'
```

### Type Guards

```ts
if (Type.is(value)) {
  // `value` narrowed to `x.TypeOf<typeof Type>`.
}
```

```ts
const sameValue = Type.satisfies(value); // Returns `value` as-is if it satisfies, otherwise throws.
```

```ts
Type.asserts(value); // Asserts `value` is `x.TypeOf<typeof Type>`.
```

### Type Diagnostics

```ts
const issues = Data.diagnose(value);
```

### Static Type

```ts
declare global {
  namespace XValue {
    interface Using extends x.UsingJSON {}
  }
}

const Data = x.object({
  foo: x.string,
  bar: x.number,
});

type Data = x.TypeOf<typeof Data>; // {foo: string; bar: number}
type DataInJSON = x.MediumTypeOf<'json', typeof Data>; // string

/** Represents a `Type` of which the decoded value is string. */
type TypeOfValueBeingData = x.XTypeOfValue<string>;

/** Represents a `Type` of which the decoded value for "json-value" medium is string. */
type TypeOfMediumValueBeingData = x.XTypeOfMediumValue<'json-value', string>;
```

### JSON Schema

X-Value has built-in (basic) support for [JSON Schema](https://json-schema.org/).

```ts
const Data = x.object({
  foo: x.string,
  bar: x.number,
});

Data.toJSONSchema(); // JSON schema
Data.exact().toJSONSchema(); // JSON schema that prohibits extra properties
```

## Medium

### Built-in Mediums

- `x.ecmascript` - Basically the same as the decoded value, but can be extended for different usages (e.g.: server and browser).
- `x.json` - JSON value **packed as string**.
- `x.extendedJSON` - JSON value **packed as string**, with extended types support (`bigint`, `Date` and `RegExp`).
- `x.jsonValue` - JSON value.
- `x.extendedJSONValue` - JSON value, with extended types support (`bigint`, `Date` and `RegExp`).
- `x.queryString` - Query string **packed as string**.
- `x.extendedQueryString` - Query string **packed as string**, with extended types support (`bigint`, `Date` and `RegExp`).

### New Medium

New medium are usually created with new atomic types.

**New atomic type**

```ts
declare global {
  namespace XValue {
    interface Types {
      // Map the decoded identifier type as string.
      [identifierTypeSymbol]: string;
    }
  }
}

const identifierTypeSymbol = Symbol();

export const Identifier = x.atomic(identifierTypeSymbol, value =>
  x.constraint(typeof value === 'string'),
);

export type Identifier = x.TypeOf<typeof Identifier>;
```

**New medium**

```ts
// This is for `XValue.Using` interface to extend.
export interface UsingMyMedium {
  // 'my-medium' is the name in `x.MediumTypeOf<'my-medium', typeof Type>`.
  'my-medium': MyMediumTypes;
}

// Atomic type mapping for "my-medium".
interface MyMediumTypes extends x.ECMAScriptTypes {
  // Map the encoded identifier type in "my-medium" as `IdentifierInMyMedium`.
  [identifierTypeSymbol]: IdentifierInMyMedium;
}

interface IdentifierInMyMedium extends Buffer {
  // Override the `toString(encoding: 'hex')` signature to preserve nominal
  // type.
  toString(encoding: 'hex'): x.TransformNominal<this, string>;
}

// Create the medium object with extended codecs.
export const myMedium = x.ecmascript.extend<UsingMyMedium>({
  codecs: {
    [identifierTypeSymbol]: {
      encode(value) {
        if (value.length === 0) {
          throw 'Value cannot be empty string';
        }

        return Buffer.from(value, 'hex');
      },
      decode(value) {
        if (!Buffer.isBuffer(value)) {
          throw 'Value must be a buffer';
        }

        return value.toString('hex');
      },
    },
  },
});
```

To use this medium:

```ts
declare global {
  namespace XValue {
    interface Using extends UsingMyMedium {}
  }
}
```

## Medium Packing

X-Value can optionally unpacks data for a structured input (e.g., `JSON.parse()`) during `decode()` and packs the data again during `encode()` (e.g., `JSON.stringify()`).

For medium that requires packing (e.g., `x.json` and `x.queryString`), different configuration is required.

```ts
export interface UsingMyPacked {
  'my-packed': MyPackedTypes;
}

interface MyPackedTypes {
  // Define the packed type instead of atomic type symbol mapping.
  packed: string;
}

const packed = x.medium<UsingMyPacked>({
  // Define packing methods.
  packing: {
    pack(data) {
      return JSON.stringify(data);
    },
    unpack(json) {
      return JSON.parse(json);
    },
  },
  // Optionally define the codec for packed medium. Use `atomicTypeSymbol` to
  // catch all atomic types without explicit codec.
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
const id = '6246056b1be8cbf6ca18401f';

ObjectId.encode(browser, id); // string '6246056b1be8cbf6ca18401f'
ObjectId.encode(rpc, id);     // packed string '"6246056b1be8cbf6ca18401f"'
ObjectId.encode(server, id);  // new ObjectId('6246056b1be8cbf6ca18401f')

const date = new Date('2022-03-31T16:00:00.000Z');

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

## License

MIT License.
