import * as x from '../library/index.js';

declare global {
  namespace XValue {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Types {
      [identifierTypeSymbol]: string;
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Using
      extends x.UsingJSONMedium,
        x.UsingExtendedJSONMedium,
        x.UsingJSONValueMedium,
        x.UsingExtendedJSONValueMedium,
        x.UsingQueryStringMedium,
        x.UsingECMAScriptMedium,
        x.UsingCommandLineMedium,
        x.UsingStringRecordsMedium,
        UsingMediumA,
        UsingMediumB {}
  }
}

export const identifierTypeSymbol = Symbol();

export const Identifier = x.atomic(identifierTypeSymbol, value =>
  x.constraint(typeof value === 'string'),
);

export type Identifier = x.TypeOf<typeof Identifier>;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface IdentifierInMediumA extends Buffer {
  toString(encoding: 'hex'): x.TransformNominal<this, string>;
}

export type MediumATypes = {
  [identifierTypeSymbol]: IdentifierInMediumA;
} & x.ECMAScriptTypes;

export type UsingMediumA = {
  'medium-a': MediumATypes;
};

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

export type MediumBTypes = {
  [identifierTypeSymbol]: number;
} & x.JSONValueTypes;

export type UsingMediumB = {
  'medium-b': MediumBTypes;
};

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

export type MediumCTypes = {
  [identifierTypeSymbol]: string;
} & x.JSONValueTypes;

export type UsingMediumC = {
  'medium-c': MediumCTypes;
};

export const mediumC = x.jsonValue.extend<UsingMediumC>();
