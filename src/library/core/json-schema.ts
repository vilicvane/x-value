/*!

MIT License

Copyright (c) 2015 - present Microsoft Corporation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

https://github.com/microsoft/vscode/blob/d619dcfc77328042e045b87e30808f5c8426943b/src/vs/base/common/jsonSchema.ts

*/

export type JSONSchemaType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'null'
  | 'array'
  | 'object';

export interface JSONSchema {
  id?: string;
  $id?: string;
  $schema?: string;
  type?: JSONSchemaType | JSONSchemaType[];
  title?: string;
  default?: any;
  definitions?: JSONSchemaMap;
  description?: string;
  properties?: JSONSchemaMap;
  patternProperties?: JSONSchemaMap;
  additionalProperties?: boolean | JSONSchema;
  minProperties?: number;
  maxProperties?: number;
  dependencies?: JSONSchemaMap | {[prop: string]: string[]};
  items?: JSONSchema | JSONSchema[];
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  additionalItems?: boolean | JSONSchema;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: boolean | number;
  exclusiveMaximum?: boolean | number;
  multipleOf?: number;
  required?: string[];
  $ref?: string;
  anyOf?: JSONSchema[];
  allOf?: JSONSchema[];
  oneOf?: JSONSchema[];
  not?: JSONSchema;
  enum?: any[];
  format?: string;

  // schema draft 06
  const?: any;
  contains?: JSONSchema;
  propertyNames?: JSONSchema;
  examples?: any[];

  // schema draft 07
  $comment?: string;
  if?: JSONSchema;
  then?: JSONSchema;
  else?: JSONSchema;

  // schema 2019-09
  unevaluatedProperties?: boolean | JSONSchema;
  unevaluatedItems?: boolean | JSONSchema;
  minContains?: number;
  maxContains?: number;
  deprecated?: boolean;
  dependentRequired?: {[prop: string]: string[]};
  dependentSchemas?: JSONSchemaMap;
  $defs?: {[name: string]: JSONSchema};
  $anchor?: string;
  $recursiveRef?: string;
  $recursiveAnchor?: string;
  $vocabulary?: any;

  // schema 2020-12
  prefixItems?: JSONSchema[];
  $dynamicRef?: string;
  $dynamicAnchor?: string;

  // VSCode extensions

  defaultSnippets?: JSONSchemaSnippet[];
  errorMessage?: string;
  patternErrorMessage?: string;
  deprecationMessage?: string;
  markdownDeprecationMessage?: string;
  enumDescriptions?: string[];
  markdownEnumDescriptions?: string[];
  markdownDescription?: string;
  doNotSuggest?: boolean;
  suggestSortText?: string;
  allowComments?: boolean;
  allowTrailingCommas?: boolean;
}

export interface JSONSchemaMap {
  [name: string]: JSONSchema;
}

export interface JSONSchemaSnippet {
  label?: string;
  description?: string;
  body?: any; // a object that will be JSON stringified
  bodyText?: string; // an already stringified JSON object that can contain new lines (\n) and tabs (\t)
}
