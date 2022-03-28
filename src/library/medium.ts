export const mediumAtomicSymbol = Symbol();

export type GeneralMediumTypes =
  | {
      [symbol: symbol]: unknown;
    }
  | {
      packed: unknown;
      [symbol: symbol]: unknown;
    };

export type MediumAtomicCodecs<TMediumTypes extends object> = {
  [TSymbol in Extract<keyof TMediumTypes, symbol>]?: __MediumAtomicCodec<
    TMediumTypes[TSymbol],
    TSymbol extends keyof XValue.Values ? XValue.Values[TSymbol] : never
  >;
} & {
  [mediumAtomicSymbol]: __MediumAtomicCodec;
};

export interface MediumPacking<TPacked> {
  pack(unpacked: unknown): TPacked;
  unpack(packed: TPacked): unknown;
}

export interface MediumOptions<
  TMediumTypes extends object = GeneralMediumTypes,
> {
  packing?: MediumPacking<MediumPackedType<TMediumTypes>>;
  codecs: MediumAtomicCodecs<TMediumTypes>;
}

export class Medium<TMediumTypes extends object = GeneralMediumTypes> {
  private packing: MediumPacking<MediumPackedType<TMediumTypes>> | undefined;
  private codecs: MediumAtomicCodecs<TMediumTypes>;

  constructor(
    readonly description: string,
    {packing, codecs}: MediumOptions<TMediumTypes>,
  ) {
    this.packing = packing;
    this.codecs = codecs;
  }

  extend<TExtendedMediumTypes extends TMediumTypes>(
    description: string,
    {packing, codecs}: MediumOptions<TExtendedMediumTypes>,
  ): Medium<TExtendedMediumTypes>;
  extend(
    description: string,
    {packing = this.packing, codecs}: MediumOptions,
  ): Medium {
    return new Medium(description, {
      packing,
      codecs: {
        ...this.codecs,
        ...codecs,
      },
    });
  }

  requireCodec<TSymbol extends keyof TMediumTypes>(
    symbol: TSymbol,
  ): MediumAtomicCodec<TMediumTypes, TSymbol>;
  requireCodec(symbol: symbol): __MediumAtomicCodec {
    let codecs = this.codecs;

    let codec =
      (codecs as Record<symbol, __MediumAtomicCodec>)[symbol] ??
      codecs[mediumAtomicSymbol];

    if (!codec) {
      throw new Error();
    }

    return codec;
  }

  unpack(packed: MediumPackedType<TMediumTypes>): unknown {
    return this.packing ? this.packing.unpack(packed) : packed;
  }

  pack(unpacked: unknown): MediumPackedType<TMediumTypes>;
  pack(unpacked: unknown): unknown {
    return this.packing ? this.packing.pack(unpacked) : unpacked;
  }
}

export type MediumAtomicCodec<
  TMediumTypes extends object = GeneralMediumTypes,
  TSymbol extends keyof TMediumTypes = keyof TMediumTypes,
> = __MediumAtomicCodec<
  TMediumTypes[TSymbol],
  TSymbol extends keyof XValue.Values ? XValue.Values[TSymbol] : never
>;

// eslint-disable-next-line @typescript-eslint/naming-convention
interface __MediumAtomicCodec<TMediumAtomic = unknown, TValue = unknown> {
  encode(value: TValue): TMediumAtomic;
  decode(value: TMediumAtomic): TValue;
}

export type MediumPackedType<TMediumTypes extends object> =
  TMediumTypes extends {packed: infer T} ? T : never;

export function medium<TMediumTypes extends object>(
  description: string,
  options: MediumOptions<TMediumTypes>,
): Medium<TMediumTypes> {
  return new Medium(description, options);
}
