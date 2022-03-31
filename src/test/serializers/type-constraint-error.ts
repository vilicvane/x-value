import type {NewPlugin} from 'pretty-format';

import {TypeConstraintError} from '../../library';

export const test: NewPlugin['test'] = value => {
  return value instanceof TypeConstraintError;
};

export const serialize: NewPlugin['serialize'] = (
  value: TypeConstraintError,
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
