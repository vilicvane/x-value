import type {Medium} from '../medium';

import type {Exact, TypeInMediumsPartial, TypeIssue, TypePath} from './type';
import {Type, __type_kind} from './type';

export class RecursiveType<TRecursive> extends Type<
  RecursiveInMediums<TRecursive>
> {
  [__type_kind]!: 'recursive';

  readonly Type: Type;

  constructor(
    recursion: (Type: RecursiveType<TRecursive>) => TypeInMediumsPartial,
  );
  constructor(recursion: (Type: RecursiveType<TRecursive>) => Type) {
    super();

    this.Type = recursion(this);
  }

  /** @internal */
  _decode(
    medium: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]] {
    let {wrappedExact} = this.getExactContext(exact, 'transparent');

    return this.Type._decode(medium, unpacked, path, wrappedExact);
  }

  /** @internal */
  _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
    exact: Exact,
    diagnose: boolean,
  ): [unknown, TypeIssue[]] {
    let {wrappedExact} = diagnose
      ? this.getExactContext(exact, 'transparent')
      : {wrappedExact: false};

    return this.Type._encode(medium, value, path, wrappedExact, diagnose);
  }

  /** @internal */
  _transform(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]] {
    let {wrappedExact} = this.getExactContext(exact, 'transparent');

    return this.Type._transform(from, to, unpacked, path, wrappedExact);
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath, exact: Exact): TypeIssue[] {
    let {wrappedExact} = this.getExactContext(exact, 'transparent');

    return this.Type._diagnose(value, path, wrappedExact);
  }
}

export function recursive<T>(
  recursion: (Type: RecursiveType<T>) => TypeInMediumsPartial,
): RecursiveType<T> {
  return new RecursiveType(recursion);
}

type RecursiveInMediums<TRecursive> = {
  [TMediumName in XValue.UsingName]: RecursiveInMedium<TRecursive, TMediumName>;
};

type RecursiveInMedium<
  TRecursive,
  TMediumName extends XValue.UsingName,
> = TRecursive extends TypeInMediumsPartial<infer TInMediums>
  ? TInMediums[TMediumName]
  : {
      [TKey in keyof TRecursive]: RecursiveInMedium<
        TRecursive[TKey],
        TMediumName
      >;
    };
