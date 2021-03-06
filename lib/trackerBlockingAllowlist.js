/** @module trackerBlockingAllowlist */

const { storeInLookup } = require('./utils')
const {
    getTrackerEntryDomain, generateDNRRule
} = require('./trackerBlocking')

// Priority that the Tracker Blocking Allowlist declarativeNetRequest rules
// start from.
const BASELINE_PRIORITY = 20000

const PRIORITY_INCREMENT = 1

// Highest possible priority Tracker Blocking Allowlist declarativeNetRequest
// rules can have.
// Note: Limited to 100 in order to be consistent with Tracker Blocking.
const CEILING_PRIORITY = 20100

const MAXIMUM_RULES_PER_TRACKER_ENTRY = (CEILING_PRIORITY - BASELINE_PRIORITY) /
                                            PRIORITY_INCREMENT

/**
 * @typedef {object} generateTrackerBlockingAllowlistRulesetResult
 * @property {object[]} ruleset
 *   The generated declarativeNetRequest ruleset.
 * @property {object} domainAndReasonByRuleId
 *   Rule ID -> tracker domain + allowlist reason.
 */

/**
 * Generated a Tracker Blocking Allowlist declarativeNetRequest ruleset.
 * @param {object} extensionConfig
 *   The extension configuration, including the allowlistedTrackers settting.
 * @param {number} [startingRuleId = 1]
 *   Rule ID for the generated declarativeNetRequest rules to start from. Rule
 *   IDs are incremented sequentially from the starting point.
 * @return {generateTrackerBlockingAllowlistRulesetResult}
 */

async function generateTrackerBlockingAllowlistRuleset (
    { features: { trackerAllowlist } }, startingRuleId = 1
) {
    if (typeof trackerAllowlist !== 'object') {
        throw new Error('Invalid Tracker Blocking Allowlist.')
    }

    const ruleset = []
    const trackerDomainAndReasonByRuleId = {}

    // No allowlisted trackers.
    if (!trackerAllowlist ||
        trackerAllowlist.state !== 'enabled' ||
        !trackerAllowlist.settings ||
        !trackerAllowlist.settings.allowlistedTrackers ||
        trackerAllowlist.settings.allowlistedTrackers.length === 0) {
        return { ruleset, trackerDomainAndReasonByRuleId }
    }

    const { allowlistedTrackers } = trackerAllowlist.settings

    // Tracker Blocking Allowlist entries have no default action. If no rules
    // match for a matching entry, then no allowlist entries should apply. Avoid
    // an allowlist entry for a less-specific domain from applying in that
    // situation.
    const excludedRequestDomainsByTrackerEntry = new Map()
    for (const trackerDomain of Object.keys(allowlistedTrackers)) {
        let currentTrackerDomain = trackerDomain
        while (currentTrackerDomain) {
            currentTrackerDomain = getTrackerEntryDomain(
                allowlistedTrackers, currentTrackerDomain, 1
            )
            if (currentTrackerDomain) {
                storeInLookup(
                    excludedRequestDomainsByTrackerEntry,
                    currentTrackerDomain,
                    [trackerDomain]
                )
            }
        }
    }

    let ruleId = startingRuleId
    for (const [trackerDomain, trackerEntry] of
        Object.entries(allowlistedTrackers)) {
        const { rules: trackerEntryRules } = trackerEntry

        if (!trackerEntryRules || trackerEntryRules.length === 0) {
            continue
        }
        if (trackerEntryRules.length > MAXIMUM_RULES_PER_TRACKER_ENTRY) {
            throw new Error(
                'Too many allowlist rules for tracker domain:', trackerDomain
            )
        }

        const requestDomains = [trackerDomain]
        const excludedRequestDomains =
              excludedRequestDomainsByTrackerEntry.get(trackerDomain)

        // Iterate through the tracker entry's rules backwards, since rules for
        // a tracker entry are matched in order and therefore the corresponding
        // declarativeNetRequest rules should have descending priority.
        let priority = BASELINE_PRIORITY
        for (let i = trackerEntryRules.length - 1; i >= 0; i--) {
            let {
                rule: urlFilter,
                domains: initiatorDomains,
                reason: allowlistReason
            } = trackerEntryRules[i]

            // Tracker Blocking Allowlist entries always have an initiator
            // domains condition, but if it's `['<all>']` it must be ignored.
            if (initiatorDomains.length === 0 ||
                initiatorDomains[0] === '<all>') {
                initiatorDomains = null
            }

            // Tracker Blocking Allowlist entries do not support regular
            // expression matching, so processTrackerRule cannot be used here.
            if (urlFilter.startsWith(trackerDomain)) {
                urlFilter = '||' + urlFilter
            }

            ruleset.push(
                generateDNRRule({
                    id: ruleId,
                    priority,
                    actionType: 'allow',
                    urlFilter,
                    // Note: In the future it would be nice to avoid
                    //       case-insensitive matching unless necessary.
                    matchCase: false,
                    requestDomains,
                    excludedRequestDomains,
                    initiatorDomains
                })
            )

            trackerDomainAndReasonByRuleId[ruleId] = {
                domain: trackerDomain,
                reason: allowlistReason
            }

            ruleId += 1
            priority += PRIORITY_INCREMENT
        }
    }

    return { ruleset, trackerDomainAndReasonByRuleId }
}

exports.BASELINE_PRIORITY = BASELINE_PRIORITY
exports.PRIORITY_INCREMENT = PRIORITY_INCREMENT
exports.CEILING_PRIORITY = CEILING_PRIORITY
exports.MAXIMUM_RULES_PER_TRACKER_ENTRY = MAXIMUM_RULES_PER_TRACKER_ENTRY

exports.generateTrackerBlockingAllowlistRuleset =
    generateTrackerBlockingAllowlistRuleset
