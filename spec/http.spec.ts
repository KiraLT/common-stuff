import { httpStatusCodes, httpStatusMessages, HttpError } from '../src'

describe('httpStatusCodes', () => {
    it('just works', () => {
        expect(httpStatusCodes[404]).toBe('Not Found')
    })
})

describe('httpStatusMessages', () => {
    it('just works', () => {
        expect(httpStatusMessages['Not Found']).toBe(404)
    })
})

describe('HttpError', () => {
    it('has status', () => {
        expect(new HttpError(404).status).toBe(404)
    })

    it('has message', () => {
        expect(new HttpError(404).message).toBe('Not Found')
        expect(new HttpError(404, '404').message).toBe('404')
    })

    it('has expose', () => {
        expect(new HttpError(404).expose).toBeTruthy()
        expect(new HttpError(500).expose).toBeFalsy()
    })

    it('has expose', () => {
        expect(new HttpError(404, undefined, {expose: false}).expose).toBeFalsy()
        expect(new HttpError(500, undefined, {expose: true}).expose).toBeTruthy()
    })

    it('supports status text input', () => {
        expect(new HttpError('Not Found').status).toBe(404)
    })
})
