export type TypePath = (
  | string
  | number
  | symbol
  | {key: string | number | symbol}
  | {argument: number}
)[];

export interface TypeIssue {
  path: TypePath;
  deferrable?: true;
  message: string;
}

export function buildIssueByError(error: unknown, path: TypePath): TypeIssue;
export function buildIssueByError(
  error: string | Error,
  path: TypePath,
): TypeIssue {
  return {
    path,
    message: typeof error === 'string' ? error : error.message,
  };
}

export function hasNonDeferrableTypeIssue(issues: TypeIssue[]): boolean {
  return issues.some(issue => !issue.deferrable);
}
