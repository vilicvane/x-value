import type {TypeInMediumsPartial} from './type-partials';

export type TupleInMedium<
  TTypeTuple extends TypeInMediumsPartial[],
  TMediumName extends XValue.UsingName,
> = {
  [TIndex in keyof TTypeTuple]: TTypeTuple[TIndex] extends TypeInMediumsPartial<
    infer TElementInMediums
  >
    ? TElementInMediums[TMediumName]
    : never;
};
