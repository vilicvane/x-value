export const __type_kind = Symbol('type kind');

export type __type_kind = typeof __type_kind;

export type TypeKindPartial<TKind extends string = string> = {
  [__type_kind]: TKind;
};

export const __type_in_mediums = Symbol('type in mediums');

export type __type_in_mediums = typeof __type_in_mediums;

export type TypeInMediums = Record<XValue.UsingName, unknown>;

export type TypeInMediumsPartial<
  TInMediums extends TypeInMediums = TypeInMediums,
> = {
  [__type_in_mediums]: TInMediums;
};
