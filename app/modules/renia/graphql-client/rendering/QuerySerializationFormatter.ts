// @env: mixed

import type { Operation } from '../types';

export interface QuerySerializationFormatter {
  format(operation: Operation): string;
}
