import type {TypeIssue, TypePath} from './type.js';

export function buildIssueByError(error: unknown, path: TypePath): TypeIssue {
  return {
    path,
    message: error instanceof Error ? error.message : String(error),
  };
}

export function hasNonDeferrableTypeIssue(issues: TypeIssue[]): boolean {
  return issues.some(issue => !issue.deferrable);
}
