import type {Medium} from '../medium';

import type {TypeInMediumsPartial, TypeIssue, TypePath} from './type';
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
  ): [unknown, TypeIssue[]] {
    let [value, issues] = this.Type._decode(medium, unpacked, path);
    return [issues.length === 0 ? value : undefined, issues];
  }

  /** @internal */
  _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
    diagnose: boolean,
  ): [unknown, TypeIssue[]] {
    let [unpacked, issues] = this.Type._encode(medium, value, path, diagnose);
    return [issues.length === 0 ? unpacked : undefined, issues];
  }

  /** @internal */
  _transform(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]] {
    let [transformedUnpacked, issues] = this.Type._transform(
      from,
      to,
      unpacked,
      path,
    );
    return [issues.length === 0 ? transformedUnpacked : undefined, issues];
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath): TypeIssue[] {
    return this.Type._diagnose(value, path);
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
