const ATOMIC_TYPE_CODECS_DEFAULT: __MediumAtomicCodec = {
  encode(value) {
    return value;
  },
  decode(value) {
    return value;
  },
};

export const atomicTypeSymbol = Symbol();

export type GeneralMediumTypes =
  | {
      [symbol: symbol]: unknown;
    }
  | {
      packed: unknown;
      [symbol: symbol]: unknown;
    };

export type GeneralUsingMedium = Medium<XValue.UsingName, object>;

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
  codecs?: MediumAtomicCodecs<TMediumTypes>;
}

export class Medium<
  TName extends string = string,
  TTypes extends object = GeneralMediumTypes,
> {
  private packing: MediumPacking<MediumTypesPackedType<TTypes>> | undefined;
  private codecs: MediumAtomicCodecs<TTypes>;

  constructor(
    readonly name: TName,
    {packing, codecs = {}}: MediumOptions<TTypes> = {},
  ) {
    this.packing = packing;
    this.codecs = codecs;
  }

  extend<TUsingExtendedMedium extends object>(
    name: Extract<keyof TUsingExtendedMedium, string>,
    {
      packing,
      codecs,
    }: MediumOptions<
      Extract<TUsingExtendedMedium[keyof TUsingExtendedMedium], object>
    >,
  ): Medium<
    Extract<keyof TUsingExtendedMedium, string>,
    Extract<TUsingExtendedMedium[keyof TUsingExtendedMedium], object>
  >;
  extend(
    name: string,
    {packing = this.packing, codecs}: MediumOptions,
  ): Medium {
    return new Medium(name, {
      packing,
      codecs: {
        ...this.codecs,
        ...codecs,
      },
    });
  }

  getCodec<TSymbol extends keyof TTypes>(
    symbol: TSymbol,
  ): MediumAtomicCodec<TTypes, TSymbol>;
  getCodec(symbol: symbol): __MediumAtomicCodec {
    const codecs = this.codecs;

    return (
      (codecs as Record<symbol, __MediumAtomicCodec>)[symbol] ??
      codecs[atomicTypeSymbol] ??
      ATOMIC_TYPE_CODECS_DEFAULT
    );
  }

  unpack(packed: MediumTypesPackedType<TTypes>): unknown {
    return this.packing ? this.packing.unpack(packed) : packed;
  }

  pack(unpacked: unknown): MediumTypesPackedType<TTypes>;
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
  decode(value: unknown): TValue;
}

export function medium<TUsingMedium extends object>(
  name: Extract<keyof TUsingMedium, string>,
  options?: MediumOptions<Extract<TUsingMedium[keyof TUsingMedium], object>>,
): Medium<
  Extract<keyof TUsingMedium, string>,
  Extract<TUsingMedium[keyof TUsingMedium], object>
> {
  return new Medium(name, options);
}

export type MediumTypesPackedType<
  TMediumTypes,
  TFallback = never,
> = TMediumTypes extends {
  packed: infer TPacked;
}
  ? TPacked
  : TFallback;

export type MediumName<TMedium extends Medium<XValue.UsingName, object>> =
  TMedium extends Medium<infer TMediumName extends XValue.UsingName, object>
    ? TMediumName
    : never;
