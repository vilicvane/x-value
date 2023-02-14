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
