export type TypePath = (
  | string
  | number
  | symbol
  | {key: string | number | symbol}
)[];

export type TypeIssue = {
  path: TypePath;
  deferrable?: true;
  message: string;
};

export function buildIssueByError(error: unknown, path: TypePath): TypeIssue {
  return {
    path,
    message: error instanceof Error ? error.message : String(error),
  };
}

export function hasNonDeferrableTypeIssue(issues: TypeIssue[]): boolean {
  return issues.some(issue => !issue.deferrable);
}
