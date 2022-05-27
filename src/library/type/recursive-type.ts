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
    let [exactContext, nestedExact, inherited] = this.getExactContext(
      exact,
      true,
    );

    let [value, issues] = this.Type._decode(
      medium,
      unpacked,
      path,
      nestedExact,
    );

    if (exactContext && !inherited) {
      issues.push(...exactContext.getIssues(unpacked, path));
    }

    return [issues.length === 0 ? value : undefined, issues];
  }

  /** @internal */
  _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
    exact: Exact,
    diagnose: boolean,
  ): [unknown, TypeIssue[]] {
    let [exactContext, nestedExact, inherited] = diagnose
      ? this.getExactContext(exact, true)
      : [undefined, false, false];

    let [unpacked, issues] = this.Type._encode(
      medium,
      value,
      path,
      nestedExact,
      diagnose,
    );

    if (exactContext && !inherited) {
      issues.push(...exactContext.getIssues(value, path));
    }

    return [issues.length === 0 ? unpacked : undefined, issues];
  }

  /** @internal */
  _transform(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]] {
    let [exactContext, nestedExact, inherited] = this.getExactContext(
      exact,
      true,
    );

    let [transformedUnpacked, issues] = this.Type._transform(
      from,
      to,
      unpacked,
      path,
      nestedExact,
    );

    if (exactContext && !inherited) {
      issues.push(...exactContext.getIssues(unpacked, path));
    }

    return [issues.length === 0 ? transformedUnpacked : undefined, issues];
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath, exact: Exact): TypeIssue[] {
    let [exactContext, nestedExact, inherited] = this.getExactContext(
      exact,
      true,
    );

    let issues = this.Type._diagnose(value, path, nestedExact);

    if (exactContext && !inherited) {
      issues.push(...exactContext.getIssues(value, path));
    }

    return issues;
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
