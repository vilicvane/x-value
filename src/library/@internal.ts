import type {Denominalize, Type, __nominal, __type} from './type';

export const hasOwnProperty = Object.prototype.hasOwnProperty;

export const toString = Object.prototype.toString;

export type __RefinedMediumType<TInMedium, TRefinement, TNominal> =
  unknown extends TNominal
    ? TInMedium & TRefinement
    : __RefinedNominalType<TInMedium & TRefinement, TNominal>;

export type __RefinedNominalType<T, TNominal> = T &
  (TNominal & Record<__type, Denominalize<T>>);

export type __TupleInMedium<
  TTypeTuple extends Type[],
  TMediumName extends keyof XValue.Using,
> = {
  [TIndex in keyof TTypeTuple]: TTypeTuple[TIndex] extends Type<
    infer TElementInMediums
  >
    ? TElementInMediums[TMediumName]
    : never;
};

export type __UnionToIntersection<TUnion> = (
  TUnion extends unknown ? (_: TUnion) => unknown : never
) extends (_: infer TIntersection) => unknown
  ? TIntersection
  : never;

export type __MediumTypesPackedType<
  TMediumTypes,
  TFallback = never,
> = TMediumTypes extends {
  packed: infer TPacked;
}
  ? TPacked
  : TFallback;

export type __ElementOrArray<T> = T | T[];

export type __NominalPartial = Record<__nominal, unknown>;

export function merge(partials: unknown[]): unknown {
  let pendingMergeKeyToValues: Map<string | number, unknown[]> | undefined;

  let merged = partials.reduce((merged, partial) => {
    if (merged === partial) {
      return merged;
    }

    if (typeof merged === 'object') {
      if (merged === null) {
        // merged !== partial
        throw new TypeError();
      }

      if (typeof partial !== 'object' || partial === null) {
        throw new TypeError();
      }

      for (let [key, value] of Object.entries(partial)) {
        let pendingMergeValues: unknown[] | undefined;

        if (pendingMergeKeyToValues) {
          pendingMergeValues = pendingMergeKeyToValues.get(key);
        } else {
          pendingMergeKeyToValues = new Map();
        }

        if (pendingMergeValues) {
          pendingMergeValues.push(value);
        } else if (hasOwnProperty.call(merged, key)) {
          pendingMergeKeyToValues.set(key, [(merged as any)[key], value]);
        } else {
          (merged as any)[key] = value;
        }
      }

      return merged;
    }

    return partial;
  });

  if (pendingMergeKeyToValues) {
    for (let [key, values] of pendingMergeKeyToValues) {
      (merged as any)[key] = merge(values);
    }
  }

  return merged;
}
