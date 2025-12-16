// @env: mixed

import type { QuerySerializationFormatter } from './QuerySerializationFormatter';
import { GraphQLRenderer } from './GraphQLRenderer';

export class DefaultGraphQLFormatter implements QuerySerializationFormatter {
  format(operation: any): string {
    const renderer = new GraphQLRenderer();
    return renderer.render(operation);
  }
}
