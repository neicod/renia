// @env: mixed
export class AuthHeaderApplier {
    apply(strategies, headers) {
        for (const strategy of strategies) {
            strategy.apply(headers);
        }
    }
}
