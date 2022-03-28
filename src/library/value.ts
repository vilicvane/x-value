import {Medium} from './medium';
import {Type, TypeToMediumType} from './type';

declare global {
  namespace XValue {
    interface Values {}
  }
}

export class Value<TType extends Type> {
  constructor(
    readonly type: TType,
    readonly value: TypeToMediumType<TType, Medium<XValue.Values>>,
  ) {}

  // to<TMedium extends Medium<unknown>>(
  //   medium: TMedium,
  // ): TypeToMediumType<TType, TMedium> {
  //   return undefined!;
  // }
}
