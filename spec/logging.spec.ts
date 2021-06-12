import { createDummyLogger, Logger } from '../src'

describe('createDummyLogger', () => {
    it('does nothing', () => {
        const logger = createDummyLogger()

        expect(logger.debug('Hello')).toBeUndefined()
        expect(logger.error('Hello')).toBeUndefined()
        expect(logger.info('Hello')).toBeUndefined()
        expect(logger.warn('Hello')).toBeUndefined()
    })
})

describe('Logger', () => {
    it('support console', () => {
        const _logger: Logger = console
    })
})
