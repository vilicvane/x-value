export const __type_kind = Symbol('type kind');

export type __type_kind = typeof __type_kind;

export interface TypeKindPartial<TKind extends string = string> {
  [__type_kind]: TKind;
}

export const __type_in_mediums = Symbol('type in mediums');

export type __type_in_mediums = typeof __type_in_mediums;

export type TypesInMediums = Record<XValue.UsingName, unknown>;

export interface TypeInMediumsPartial<
  TInMediums extends TypesInMediums = TypesInMediums,
> {
  [__type_in_mediums]: TInMediums;
}
