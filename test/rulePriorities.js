import * as assert from 'assert'

import { SMARTER_ENCRYPTION_PRIORITY } from '../lib/smarterEncryption.js'

import {
    BASELINE_PRIORITY as TRACKER_BLOCKING_BASELINE_PRIORITY,
    CEILING_PRIORITY as TRACKER_BLOCKING_CEILING_PRIORITY
} from '../lib/trackerBlocking.js'

import {
    BASELINE_PRIORITY as TRACKER_ALLOWLIST_BASELINE_PRIORITY,
    CEILING_PRIORITY as TRACKER_ALLOWLIST_CEILING_PRIORITY
} from '../lib/trackerAllowlist.js'

describe('Rule Priorities', () => {
    it('correct relative rule priorities', () => {
        // Tracker Blocking priorities.
        assert.ok(TRACKER_BLOCKING_BASELINE_PRIORITY > 0)
        assert.ok(TRACKER_BLOCKING_CEILING_PRIORITY >
                  TRACKER_BLOCKING_BASELINE_PRIORITY)

        // Tracker Allowlist priorities.
        assert.ok(TRACKER_ALLOWLIST_BASELINE_PRIORITY >
                  TRACKER_BLOCKING_CEILING_PRIORITY)

        // Smarter Encryption priority.
        // Note: It's important that the Smarter Encryption rule priority is
        //       higher than the priority for Tracker Blocking etc rules.
        //       After a request is redirected to use HTTPS, the redirected
        //       request will still match against other block/allow rules. But
        //       after an allow rules matches a request, upgrade schema rules
        //       will no longer have the opportunity to match.
        assert.ok(SMARTER_ENCRYPTION_PRIORITY >
                  TRACKER_ALLOWLIST_CEILING_PRIORITY)
    })
})
