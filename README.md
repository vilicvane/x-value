# X-Value

X-Value (X stands for "cross") is a medium-somewhat-neutral alternative to libraries like [io-ts](https://github.com/gcanti/io-ts) and [Zod](https://github.com/colinhacks/zod).

Comparing to the input/output concept of io-ts or Zod, X-Value uses Medium and allows multiple input "mediums", and the output is referred as "value".

**Currently under development.**

- [ ] Better `TypeConstraintError`.
- [ ] Self referencing types.
- [ ] 100% test coverage.

> I seriously doubt the usefulness of the medium/value concept in practice, after I prototyped X-Value.

## Defining Types

Defining types with X-Value is similar to io-ts/Zod.

```ts
import * as x from 'x-value';

const Oops = x.object({
  foo: x.string,
  bar: x.optional(x.number),
});

const Aha = x.array(Oops);

const Um = x.union(Oops, x.boolean);

const I = x.intersection(
  Oops,
  x.object({
    yoha: x.boolean,
  }),
);
```

## Mediums and Value

Assuming we have 3 mediums: `browserMedium`, `serverMedium`, and `rpcMedium`. Considering types `ObjectId` and `Date`, their types in the 3 mediums are listed below.

| Type\Medium | Browser  | RPC                | Server     | Value    |
| ----------- | -------- | ------------------ | ---------- | -------- |
| `ObjectId`  | `string` | packed as `string` | `ObjectId` | `string` |
| `Date`      | `Date`   | packed as `string` | `Date`     | `Date`   |

We can encoding value to a medium:

```ts
let id = '6246056b1be8cbf6ca18401f';

// string '6246056b1be8cbf6ca18401f'
ObjectId.encode(browserMedium, id);
// packed string '"6246056b1be8cbf6ca18401f"'
ObjectId.encode(rpcMedium, id);
// new ObjectId('6246056b1be8cbf6ca18401f')
ObjectId.encode(serverMedium, id);

let date = new Date('2022-03-31T16:00:00.000Z');

// new Date('2022-03-31T16:00:00.000Z')
Date.encode(browserMedium, date);
// packed string '"2022-03-31T16:00:00.000Z"'
Date.encode(rpcMedium, date);
// new Date('2022-03-31T16:00:00.000Z')
Date.encode(serverMedium, date);
```

Or decoding packed data of a medium to value:

```ts
// All results in '6246056b1be8cbf6ca18401f'
ObjectId.decode(browserMedium, '6246056b1be8cbf6ca18401f');
ObjectId.decode(rpcMedium, '"6246056b1be8cbf6ca18401f"');
ObjectId.decode(serverMedium, new ObjectId('6246056b1be8cbf6ca18401f'));

// All results in new Date('2022-03-31T16:00:00.000Z')
Date.decode(browserMedium, new Date('2022-03-31T16:00:00.000Z'));
Date.decode(rpcMedium, '"2022-03-31T16:00:00.000Z"');
Date.decode(serverMedium, new Date('2022-03-31T16:00:00.000Z'));
```

## License

MIT License.
