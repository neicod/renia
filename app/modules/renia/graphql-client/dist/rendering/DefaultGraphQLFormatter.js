// @env: mixed
import { GraphQLRenderer } from './GraphQLRenderer';
export class DefaultGraphQLFormatter {
    format(operation) {
        const renderer = new GraphQLRenderer();
        return renderer.render(operation);
    }
}
