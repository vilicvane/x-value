import {medium} from '../core/index.js';

import {EXTENDED_STRING_CODECS, STRING_CODECS} from './@string.js';

const NAMED_ARGUMENT_PATTERN = /^--([^=]+)(?:=(.*))?$/;

export type CommandLineTypes = {
  packed: string[];
};

export type UsingCommandLineMedium = {
  'command-line': CommandLineTypes;
};

export const commandLine = medium<UsingCommandLineMedium>({
  packing: {
    pack() {
      throw new Error('Not implemented');
    },
    unpack(args) {
      return parse(args);
    },
  },
  codecs: {
    ...STRING_CODECS,
    ...EXTENDED_STRING_CODECS,
  },
});

function parse(args: string[]): string[] & Record<string, string> {
  const parsed = [] as unknown as string[] & Record<string, string>;

  for (const arg of args) {
    const groups = NAMED_ARGUMENT_PATTERN.exec(arg);

    if (groups) {
      const [, name, value] = groups;
      parsed[name] = value ?? 'true';
    } else {
      parsed.push(arg);
    }
  }

  return parsed;
}
