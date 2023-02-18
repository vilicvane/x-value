import * as x from '../library';

test('basic support', () => {
  const Type = x.object({
    foo: x.string,
    bar: x.number.optional(),
    array: x.array(
      x.intersection([
        x.object({
          tuple: x.tuple([x.string, x.number]),
          nested: x.object({
            x: x.number,
          }),
        }),
        x.object({
          oops: x.boolean.optional(),
          nested: x.object({
            y: x.number,
          }),
        }),
      ]),
    ),
    record: x.record(x.string, x.number),
    union: x.union([x.string, x.number]),
    refined: x.string.refined([]),
    recursive: x.recursive(R => x.object({r: R.optional()})),
  });

  expect(Type.toJSONSchema()).toMatchInlineSnapshot(`
    {
      "$defs": {
        "type-1": {
          "prefixItems": [
            {
              "type": "string",
            },
            {
              "type": "number",
            },
          ],
          "type": "array",
        },
        "type-10": {
          "$ref": "#/$defs/type-11",
        },
        "type-11": {
          "properties": {
            "r": {
              "$ref": "#/$defs/type-10",
            },
          },
          "required": [],
          "type": "object",
        },
        "type-12": {
          "properties": {
            "array": {
              "$ref": "#/$defs/type-7",
            },
            "bar": {
              "type": "number",
            },
            "foo": {
              "type": "string",
            },
            "record": {
              "$ref": "#/$defs/type-8",
            },
            "recursive": {
              "$ref": "#/$defs/type-10",
            },
            "refined": {
              "type": "string",
            },
            "union": {
              "$ref": "#/$defs/type-9",
            },
          },
          "required": [
            "foo",
            "array",
            "record",
            "union",
            "refined",
            "recursive",
          ],
          "type": "object",
        },
        "type-2": {
          "properties": {
            "x": {
              "type": "number",
            },
          },
          "required": [
            "x",
          ],
          "type": "object",
        },
        "type-3": {
          "properties": {
            "nested": {
              "$ref": "#/$defs/type-2",
            },
            "tuple": {
              "$ref": "#/$defs/type-1",
            },
          },
          "required": [
            "tuple",
            "nested",
          ],
          "type": "object",
        },
        "type-4": {
          "properties": {
            "y": {
              "type": "number",
            },
          },
          "required": [
            "y",
          ],
          "type": "object",
        },
        "type-5": {
          "properties": {
            "nested": {
              "$ref": "#/$defs/type-4",
            },
            "oops": {
              "type": "boolean",
            },
          },
          "required": [
            "nested",
          ],
          "type": "object",
        },
        "type-6": {
          "properties": {
            "nested": {
              "properties": {
                "x": {
                  "type": "number",
                },
                "y": {
                  "type": "number",
                },
              },
              "required": [
                "x",
                "y",
              ],
              "type": "object",
            },
            "oops": {
              "type": "boolean",
            },
            "tuple": {
              "$ref": "#/$defs/type-1",
            },
          },
          "required": [
            "tuple",
            "nested",
          ],
          "type": "object",
        },
        "type-7": {
          "items": {
            "$ref": "#/$defs/type-6",
          },
          "type": "array",
        },
        "type-8": {
          "additionalProperties": {
            "type": "number",
          },
          "propertyNames": {
            "type": "string",
          },
          "type": "object",
        },
        "type-9": {
          "anyOf": [
            {
              "type": "string",
            },
            {
              "type": "number",
            },
          ],
        },
      },
      "$ref": "#/$defs/type-12",
    }
  `);
});

test('exact', () => {
  const Type_1 = x.object({
    foo: x.string,
    bar: x.number.optional(),
  });

  const Type_2 = x.object({
    foo: x.string,
    bar: Type_1.exact(false),
  });

  const R = x.recursive(R => x.object({r: R.optional()}));

  const Type_3 = x.object({
    foo: Type_2.exact(),
    recursive: R,
    exactRecursive: R.exact(),
  });

  expect(Type_1.exact().toJSONSchema()).toMatchInlineSnapshot(`
    {
      "$defs": {
        "type-1": {
          "additionalProperties": false,
          "properties": {
            "bar": {
              "type": "number",
            },
            "foo": {
              "type": "string",
            },
          },
          "required": [
            "foo",
          ],
          "type": "object",
        },
      },
      "$ref": "#/$defs/type-1",
    }
  `);

  expect(Type_2.exact().toJSONSchema()).toMatchInlineSnapshot(`
    {
      "$defs": {
        "type-1": {
          "properties": {
            "bar": {
              "type": "number",
            },
            "foo": {
              "type": "string",
            },
          },
          "required": [
            "foo",
          ],
          "type": "object",
        },
        "type-2": {
          "additionalProperties": false,
          "properties": {
            "bar": {
              "$ref": "#/$defs/type-1",
            },
            "foo": {
              "type": "string",
            },
          },
          "required": [
            "foo",
            "bar",
          ],
          "type": "object",
        },
      },
      "$ref": "#/$defs/type-2",
    }
  `);

  expect(Type_3.toJSONSchema()).toMatchInlineSnapshot(`
    {
      "$defs": {
        "type-1": {
          "properties": {
            "bar": {
              "type": "number",
            },
            "foo": {
              "type": "string",
            },
          },
          "required": [
            "foo",
          ],
          "type": "object",
        },
        "type-2": {
          "additionalProperties": false,
          "properties": {
            "bar": {
              "$ref": "#/$defs/type-1",
            },
            "foo": {
              "type": "string",
            },
          },
          "required": [
            "foo",
            "bar",
          ],
          "type": "object",
        },
        "type-3": {
          "$ref": "#/$defs/type-4",
        },
        "type-4": {
          "properties": {
            "r": {
              "$ref": "#/$defs/type-3",
            },
          },
          "required": [],
          "type": "object",
        },
        "type-5": {
          "$ref": "#/$defs/type-7",
        },
        "type-6": {
          "$ref": "#/$defs/type-7",
        },
        "type-7": {
          "additionalProperties": false,
          "properties": {
            "r": {
              "$ref": "#/$defs/type-6",
            },
          },
          "required": [],
          "type": "object",
        },
        "type-8": {
          "properties": {
            "exactRecursive": {
              "$ref": "#/$defs/type-5",
            },
            "foo": {
              "$ref": "#/$defs/type-2",
            },
            "recursive": {
              "$ref": "#/$defs/type-3",
            },
          },
          "required": [
            "foo",
            "recursive",
            "exactRecursive",
          ],
          "type": "object",
        },
      },
      "$ref": "#/$defs/type-8",
    }
  `);

  expect(
    x
      .array(x.object({foo: x.string}))
      .exact()
      .toJSONSchema(),
  ).toMatchInlineSnapshot(`
    {
      "$defs": {
        "type-1": {
          "additionalProperties": false,
          "properties": {
            "foo": {
              "type": "string",
            },
          },
          "required": [
            "foo",
          ],
          "type": "object",
        },
        "type-2": {
          "items": {
            "$ref": "#/$defs/type-1",
          },
          "type": "array",
        },
      },
      "$ref": "#/$defs/type-2",
    }
  `);

  expect(
    x
      .object({
        foo: x.intersection([
          x.object({x: x.number}).exact(false),
          x.object({y: x.number}).exact(false),
        ]),
      })
      .exact()
      .toJSONSchema(),
  ).toMatchInlineSnapshot(`
    {
      "$defs": {
        "type-1": {
          "properties": {
            "x": {
              "type": "number",
            },
          },
          "required": [
            "x",
          ],
          "type": "object",
        },
        "type-2": {
          "properties": {
            "y": {
              "type": "number",
            },
          },
          "required": [
            "y",
          ],
          "type": "object",
        },
        "type-3": {
          "additionalProperties": false,
          "properties": {
            "x": {
              "type": "number",
            },
            "y": {
              "type": "number",
            },
          },
          "required": [
            "x",
            "y",
          ],
          "type": "object",
        },
        "type-4": {
          "additionalProperties": false,
          "properties": {
            "foo": {
              "$ref": "#/$defs/type-3",
            },
          },
          "required": [
            "foo",
          ],
          "type": "object",
        },
      },
      "$ref": "#/$defs/type-4",
    }
  `);

  expect(
    x
      .object({
        foo: x
          .intersection([x.object({x: x.number}), x.object({y: x.number})])
          .exact(),
      })
      .toJSONSchema(),
  ).toMatchInlineSnapshot(`
    {
      "$defs": {
        "type-1": {
          "additionalProperties": false,
          "properties": {
            "x": {
              "type": "number",
            },
          },
          "required": [
            "x",
          ],
          "type": "object",
        },
        "type-2": {
          "additionalProperties": false,
          "properties": {
            "y": {
              "type": "number",
            },
          },
          "required": [
            "y",
          ],
          "type": "object",
        },
        "type-3": {
          "additionalProperties": false,
          "properties": {
            "x": {
              "type": "number",
            },
            "y": {
              "type": "number",
            },
          },
          "required": [
            "x",
            "y",
          ],
          "type": "object",
        },
        "type-4": {
          "properties": {
            "foo": {
              "$ref": "#/$defs/type-3",
            },
          },
          "required": [
            "foo",
          ],
          "type": "object",
        },
      },
      "$ref": "#/$defs/type-4",
    }
  `);

  expect(
    x
      .record(
        x.string,
        x.object({
          foo: x.string,
        }),
      )
      .exact()
      .toJSONSchema(),
  ).toMatchInlineSnapshot(`
    {
      "$defs": {
        "type-1": {
          "additionalProperties": false,
          "properties": {
            "foo": {
              "type": "string",
            },
          },
          "required": [
            "foo",
          ],
          "type": "object",
        },
        "type-2": {
          "additionalProperties": {
            "$ref": "#/$defs/type-1",
          },
          "propertyNames": {
            "type": "string",
          },
          "type": "object",
        },
      },
      "$ref": "#/$defs/type-2",
    }
  `);

  expect(
    x
      .object({
        foo: x.string,
      })
      .refined([])
      .exact()
      .toJSONSchema(),
  ).toMatchInlineSnapshot(`
    {
      "$defs": {
        "type-1": {
          "additionalProperties": false,
          "properties": {
            "foo": {
              "type": "string",
            },
          },
          "required": [
            "foo",
          ],
          "type": "object",
        },
      },
      "$ref": "#/$defs/type-1",
    }
  `);

  expect(
    x
      .tuple([
        x.object({
          foo: x.string,
        }),
        x.string,
      ])
      .exact()
      .toJSONSchema(),
  ).toMatchInlineSnapshot(`
    {
      "$defs": {
        "type-1": {
          "additionalProperties": false,
          "properties": {
            "foo": {
              "type": "string",
            },
          },
          "required": [
            "foo",
          ],
          "type": "object",
        },
        "type-2": {
          "prefixItems": [
            {
              "$ref": "#/$defs/type-1",
            },
            {
              "type": "string",
            },
          ],
          "type": "array",
        },
      },
      "$ref": "#/$defs/type-2",
    }
  `);

  expect(
    x
      .union([
        x.object({
          foo: x.string,
        }),
        x.string,
      ])
      .exact()
      .toJSONSchema(),
  ).toMatchInlineSnapshot(`
    {
      "$defs": {
        "type-1": {
          "additionalProperties": false,
          "properties": {
            "foo": {
              "type": "string",
            },
          },
          "required": [
            "foo",
          ],
          "type": "object",
        },
        "type-2": {
          "anyOf": [
            {
              "$ref": "#/$defs/type-1",
            },
            {
              "type": "string",
            },
          ],
        },
      },
      "$ref": "#/$defs/type-2",
    }
  `);
});

test('refined type', () => {
  expect(x.string.refined([], {maxLength: 10}).toJSONSchema())
    .toMatchInlineSnapshot(`
    {
      "$defs": {},
      "maxLength": 10,
      "type": "string",
    }
  `);
  expect(x.literal(123).toJSONSchema()).toMatchInlineSnapshot(`
    {
      "$defs": {},
      "type": "number",
    }
  `);
  expect(
    x
      .object({foo: x.string})
      .refined([], {description: 'Some random object'})
      .toJSONSchema(),
  ).toMatchInlineSnapshot(`
    {
      "$defs": {
        "type-1": {
          "properties": {
            "foo": {
              "type": "string",
            },
          },
          "required": [
            "foo",
          ],
          "type": "object",
        },
        "type-2": {
          "allOf": [
            {
              "$ref": "#/$defs/type-1",
            },
          ],
          "description": "Some random object",
        },
      },
      "$ref": "#/$defs/type-2",
    }
  `);
  expect(
    x
      .literal('user')
      .nominal<'user keyword'>({description: 'Some random keyword'})
      .toJSONSchema(),
  ).toMatchInlineSnapshot(`
    {
      "$defs": {},
      "description": "Some random keyword",
      "type": "string",
    }
  `);
});

test('not supported', () => {
  expect(() => x.undefined.toJSONSchema()).toThrowErrorMatchingInlineSnapshot(
    `"JSON schema is not defined for this atomic type"`,
  );
  expect(() =>
    x.function([], x.void).toJSONSchema(),
  ).toThrowErrorMatchingInlineSnapshot(
    `"Cannot convert Function type to JSON Schema"`,
  );
  expect(() =>
    x
      .intersection([
        x.object({
          foo: x.string,
        }),
        x.boolean,
      ])
      .toJSONSchema(),
  ).toThrowErrorMatchingInlineSnapshot(
    `"Cannot merge non-object JSON schemas"`,
  );
});
