export class YouCantReturnThisBikeError extends Error {
    public readonly name = 'YouCantReturnThisBikeError'

    constructor() {
        super('Rent not found. You cant return this bike')
    }
}