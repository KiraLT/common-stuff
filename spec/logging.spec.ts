import assert from 'node:assert/strict'
import test from 'node:test'

import { createDummyLogger, type Logger } from '../src/index.ts'

test('createDummyLogger', async (t) => {
    await t.test('does nothing', () => {
        const logger = createDummyLogger()
        assert.equal(logger.debug('Hello'), undefined)
        assert.equal(logger.error('Hello'), undefined)
        assert.equal(logger.info('Hello'), undefined)
        assert.equal(logger.warn('Hello'), undefined)
    })
})

test('Logger', async (t) => {
    await t.test('support console', () => {
        const _logger: Logger = console
        assert.ok(_logger)
    })
})
