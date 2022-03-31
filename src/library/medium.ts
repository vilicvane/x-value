export const atomicTypeSymbol = Symbol();

export type GeneralMediumTypes =
  | {
      [symbol: symbol]: unknown;
    }
  | {
      packed: unknown;
      [symbol: symbol]: unknown;
    };

export type MediumAtomicCodecs<TMediumTypes extends object> = {
  [TSymbol in keyof XValue.Types]?: __MediumAtomicCodec<
    TMediumTypes extends {[TKey in TSymbol]: infer T} ? T : unknown,
    XValue.Types[TSymbol]
  >;
} & {
  [atomicTypeSymbol]?: __MediumAtomicCodec;
};

export interface MediumPacking<TPacked> {
  pack(unpacked: unknown): TPacked;
  unpack(packed: TPacked): unknown;
}

export interface MediumOptions<
  TMediumTypes extends object = GeneralMediumTypes,
> {
  packing?: MediumPacking<MediumTypesPackedType<TMediumTypes>>;
  codecs: MediumAtomicCodecs<TMediumTypes>;
}

export class Medium<TMediumTypes extends object = GeneralMediumTypes> {
  private packing:
    | MediumPacking<MediumTypesPackedType<TMediumTypes>>
    | undefined;
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
      codecs[atomicTypeSymbol];

    if (!codec) {
      throw new Error();
    }

    return codec;
  }

  unpack(packed: MediumTypesPackedType<TMediumTypes>): unknown {
    return this.packing ? this.packing.unpack(packed) : packed;
  }

  pack(unpacked: unknown): MediumTypesPackedType<TMediumTypes>;
  pack(unpacked: unknown): unknown {
    return this.packing ? this.packing.pack(unpacked) : unpacked;
  }
}

export type MediumAtomicCodec<
  TMediumTypes extends object = GeneralMediumTypes,
  TSymbol extends keyof TMediumTypes = keyof TMediumTypes,
> = __MediumAtomicCodec<
  TMediumTypes[TSymbol],
  TSymbol extends keyof XValue.Types ? XValue.Types[TSymbol] : unknown
>;

// eslint-disable-next-line @typescript-eslint/naming-convention
interface __MediumAtomicCodec<TMediumAtomic = unknown, TValue = unknown> {
  encode(value: TValue): TMediumAtomic;
  decode(value: TMediumAtomic): TValue;
}

export type MediumTypesPackedType<TMediumTypes extends object> =
  TMediumTypes extends {packed: infer T} ? T : never;

export type MediumPackedType<TMedium extends Medium<object>> =
  TMedium extends Medium<infer TMediumTypes>
    ? MediumTypesPackedType<TMediumTypes>
    : never;

export function medium<TMediumTypes extends object>(
  description: string,
  options: MediumOptions<TMediumTypes>,
): Medium<TMediumTypes> {
  return new Medium(description, options);
}
