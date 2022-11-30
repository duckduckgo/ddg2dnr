const assert = require('assert')
const { CEILING_PRIORITY } = require('../lib/trackerAllowlist')
const { CEILING_PRIORITY: TDS_CEILING_PRIORITY } = require('../lib/tds')
const { COOKIE_PRIORITY } = require('../lib/cookies')

describe('cookie rules', () => {
    it('have higher priority than tracker allowlist rules', () => {
        assert.ok(COOKIE_PRIORITY > CEILING_PRIORITY)
        assert.ok(COOKIE_PRIORITY > TDS_CEILING_PRIORITY)
    })
})
