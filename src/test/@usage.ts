import * as x from '../library/index.js';

declare global {
  namespace XValue {
    interface Types {
      [identifierTypeSymbol]: string;
    }

    interface Using
      extends x.UsingJSONMedium,
        x.UsingExtendedJSONMedium,
        x.UsingJSONValueMedium,
        x.UsingExtendedJSONValueMedium,
        x.UsingQueryStringMedium,
        x.UsingExtendedQueryStringMedium,
        x.UsingECMAScriptMedium,
        UsingMediumA,
        UsingMediumB {}
  }
}

export const identifierTypeSymbol = Symbol();

export const Identifier = x.atomic(identifierTypeSymbol, value =>
  x.constraint(typeof value === 'string'),
);

export type Identifier = x.TypeOf<typeof Identifier>;

export interface IdentifierInMediumA extends Buffer {
  toString(encoding: 'hex'): x.TransformNominal<this, string>;
}

export interface MediumATypes extends x.ECMAScriptTypes {
  [identifierTypeSymbol]: IdentifierInMediumA;
}

export interface UsingMediumA {
  'medium-a': MediumATypes;
}

export const mediumA = x.ecmascript.extend<UsingMediumA>({
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

export interface MediumBTypes extends x.JSONValueTypes {
  [identifierTypeSymbol]: number;
}

export interface UsingMediumB {
  'medium-b': MediumBTypes;
}

export const mediumB = x.jsonValue.extend<UsingMediumB>({
  codecs: {
    [identifierTypeSymbol]: {
      encode(value) {
        if (value.length === 0) {
          throw 'Value cannot be empty string';
        }

        return Buffer.from(value, 'hex').readUint16BE();
      },
      decode(value) {
        if (typeof value !== 'number') {
          throw 'Value must be a number';
        }

        const buffer = Buffer.alloc(2);

        buffer.writeUInt16BE(value);

        return buffer.toString('hex');
      },
    },
  },
});

export interface MediumCTypes extends x.JSONValueTypes {
  [identifierTypeSymbol]: string;
}

export interface UsingMediumC {
  'medium-c': MediumCTypes;
}

export const mediumC = x.jsonValue.extend<UsingMediumC>();
