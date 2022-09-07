const assert = require('assert')

const {
    generateTdsRuleset
} = require('../lib/tds')

/** @type Record<string, Array<string, string>[]> */
const surrogatesConfig = {}

describe('generateTdsRuleset', () => {
    it('should reject invalid tds.json file', async () => {
        const invalidBlockLists = [
            undefined,
            1,
            {},
            { domains: {}, entities: {}, trackers: {} },
            { cnames: {}, entities: {}, trackers: {} },
            { cnames: {}, domains: {}, trackers: {} },
            { cnames: {}, domains: {}, entities: {} },
            { cnames: 1, domains: 2, entities: 3, trackers: 4 }
        ]

        for (const blockList of invalidBlockLists) {
            await assert.rejects(() =>
                generateTdsRuleset(blockList, surrogatesConfig, '', () => { })
            )
        }
    })

    it('should notice missing isRegexSupported argument', async () => {
        await assert.rejects(() =>
            // @ts-expect-error - Missing isRegexSupported argument.
            generateTdsRuleset(
                { cnames: {}, domains: {}, entities: {}, trackers: {} }
            )
        )
        await assert.rejects(() =>
            generateTdsRuleset(
                { cnames: {}, domains: {}, entities: {}, trackers: {} },
                // @ts-expect-error - Invalid isRegexSupported argument.
                surrogatesConfig, '', 3
            )
        )
    })

    it('should reject an invalid surrogates mapping', async () => {
        await assert.rejects(() =>
            generateTdsRuleset(
                { cnames: {}, domains: {}, entities: {}, trackers: {} },
                // @ts-expect-error - Invalid surrogates argument.
                null, '', 3
            )
        )
    })
})
