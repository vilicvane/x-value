import type {NewPlugin} from 'pretty-format';

import * as x from '../../library';

export const test: NewPlugin['test'] = value => {
  return value instanceof x.TypeConstraintError;
};

export const serialize: NewPlugin['serialize'] = (
  value: x.TypeConstraintError,
  config,
  indentation,
  depth,
  refs,
  printer,
) => {
  return `[${value.toString()}]${printer(
    {issues: value.issues},
    config,
    indentation,
    depth,
    refs,
  )}`;
};
