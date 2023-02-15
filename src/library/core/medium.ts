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

export type GeneralUsingMedium = Record<string, GeneralMediumTypes>;

export type MediumAtomicCodecs<TMediumTypes> = {
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

export interface MediumOptions<TUsingMedium> {
  packing?: MediumPacking<UsingMediumPackedType<TUsingMedium>>;
  codecs?: MediumAtomicCodecs<TUsingMedium[keyof TUsingMedium]>;
}

export class Medium<TUsingMedium extends object = GeneralUsingMedium> {
  private packing:
    | MediumPacking<UsingMediumPackedType<GeneralUsingMedium>>
    | undefined;
  private codecs: MediumAtomicCodecs<GeneralMediumTypes>;

  constructor({packing, codecs = {}}: MediumOptions<TUsingMedium> = {}) {
    this.packing = packing;
    this.codecs = codecs;
  }

  extend<TUsingExtendedMedium extends object>(
    options?: MediumOptions<TUsingExtendedMedium>,
  ): Medium<TUsingExtendedMedium>;
  extend({
    packing = this.packing,
    codecs,
  }: MediumOptions<GeneralUsingMedium> = {}): Medium {
    return new Medium({
      packing,
      codecs: {
        ...this.codecs,
        ...codecs,
      },
    });
  }

  getCodec(symbol: symbol): __MediumAtomicCodec {
    const codecs = this.codecs;

    return (
      (codecs as Record<symbol, __MediumAtomicCodec>)[symbol] ??
      codecs[atomicTypeSymbol] ??
      ATOMIC_TYPE_CODECS_DEFAULT
    );
  }

  unpack(packed: unknown): unknown {
    return this.packing ? this.packing.unpack(packed) : packed;
  }

  pack(unpacked: unknown): unknown {
    return this.packing ? this.packing.pack(unpacked) : unpacked;
  }
}

export type MediumAtomicCodec<
  TMediumTypes,
  TSymbol extends keyof TMediumTypes,
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
  options?: MediumOptions<TUsingMedium>,
): Medium<TUsingMedium> {
  return new Medium(options);
}

export type UsingMediumPackedType<TUsingMedium> = MediumTypesPackedType_<
  TUsingMedium[keyof TUsingMedium],
  unknown
>;

export type MediumPackedType<
  TMedium extends Medium<object>,
  TInMediums,
> = TMedium extends Medium<infer TUsingMedium>
  ? MediumTypesPackedType_<
      TUsingMedium[keyof TUsingMedium],
      TInMediums[Extract<keyof TUsingMedium, keyof TInMediums>]
    >
  : never;

type MediumTypesPackedType_<TMediumTypes, TFallback> = TMediumTypes extends {
  packed: infer TPacked;
}
  ? TPacked
  : TFallback;

export type UsingMediumName<TMedium extends Medium> = TMedium extends Medium<
  Record<infer TName, GeneralMediumTypes>
>
  ? Extract<TName, XValue.UsingName>
  : never;
