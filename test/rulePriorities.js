const assert = require('assert')

const {
    SMARTER_ENCRYPTION_PRIORITY
} = require('../lib/smarterEncryption')

const {
    BASELINE_PRIORITY: TRACKER_BLOCKING_BASELINE_PRIORITY,
    CEILING_PRIORITY: TRACKER_BLOCKING_CEILING_PRIORITY
} = require('../lib/trackerBlocking')

const {
    BASELINE_PRIORITY: TRACKER_ALLOWLIST_BASELINE_PRIORITY,
    CEILING_PRIORITY: TRACKER_ALLOWLIST_CEILING_PRIORITY
} = require('../lib/trackerAllowlist')

const {
    PRIORITY: SURROGATES_PRIORITY
} = require('../lib/surrogates')

describe('Rule Priorities', () => {
    it('correct relative rule priorities', () => {
        // Blocking/allowing rules.

        // Tracker Blocking priorities.
        assert.ok(TRACKER_BLOCKING_BASELINE_PRIORITY > 0)
        assert.ok(TRACKER_BLOCKING_CEILING_PRIORITY >
                  TRACKER_BLOCKING_BASELINE_PRIORITY)

        // Tracker Allowlist priorities.
        assert.ok(TRACKER_ALLOWLIST_BASELINE_PRIORITY >
                  TRACKER_BLOCKING_CEILING_PRIORITY)

        // Redirection rules.
        // Notes:
        //   - It's important that the redirection rules have a higher priority
        //     than Tracker Blocking etc rules. After a request is redirect, the
        //     request will still match against other block/allow rules. But
        //     after an allow rules matches a request, the redirection rules
        //     will no longer have the opportunity to match.
        //   - Relative priority between redirection rules does not matter for
        //     the same reason.

        // Smarter Encryption priority.
        assert.ok(SMARTER_ENCRYPTION_PRIORITY >
                  TRACKER_ALLOWLIST_CEILING_PRIORITY)

        // Surrogate Scripts redirection priority.
        assert.ok(SURROGATES_PRIORITY >
                  TRACKER_ALLOWLIST_CEILING_PRIORITY)
    })
})
