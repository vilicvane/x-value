import type {MediumAtomicCodecs} from '../core/index.js';
import {medium} from '../core/index.js';

import type {ExtendedStringTypes, StringTypes} from './@string.js';
import {EXTENDED_STRING_CODECS, STRING_CODECS} from './@string.js';

export type StringRecordsTypes = StringTypes & ExtendedStringTypes;

export type UsingStringRecordsMedium = {
  'string-records': StringRecordsTypes;
};

export const stringRecords = medium<UsingStringRecordsMedium>({
  codecs: {
    ...STRING_CODECS,
    ...EXTENDED_STRING_CODECS,
  } as MediumAtomicCodecs<StringRecordsTypes>,
});
