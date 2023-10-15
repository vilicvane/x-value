import type {TypeIssue, TypePath} from './@type-issue.js';

export class ExactContext {
  touched = false;
  neutralized = false;

  private keySet = new Set<string>();

  get keys(): string[] {
    return Array.from(this.keySet);
  }

  neutralize(): void {
    this.neutralized = true;
  }

  addKeys(keys: string[]): void {
    this.touched = true;

    const set = this.keySet;

    for (const key of keys) {
      set.add(key);
    }
  }

  getUnknownKeyIssues(
    value: unknown,
    path: TypePath,
  ): (TypeIssue & {deferrable: true})[] {
    if (!this.touched || this.neutralized) {
      return [];
    }

    const keySet = this.keySet;
    const unknownKeys = Object.keys(value as object).filter(
      key => !keySet.has(key),
    );

    if (unknownKeys.length === 0) {
      return [];
    }

    return [
      {
        path,
        deferrable: true,
        message: `Unknown key(s) ${unknownKeys
          .map(key => JSON.stringify(key))
          .join(', ')}.`,
      },
    ];
  }
}

export type Exact = ExactContext | boolean | 'disabled';
