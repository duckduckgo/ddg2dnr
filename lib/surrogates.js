/** @module surrogates */

const {
    generateDNRRule,
    getEntityDomains,
    getTrackerEntryDomain,
    processPlaintextTrackerRule
} = require('./utils')

const PRIORITY = 100000

/**
 * Generates a declarativeNetRequest rule for the given surrogate script.
 * @param {string} surrogateRule
 *   The surrogate script matching rule (literally matched string).
 * @param {string} surrogateScriptPath
 *   The surrogate script path.
 * @return {import('./utils').DNRRule}
 */
function generateSurrogateDNRRule (
    tds, trackerDomain, surrogateRule, surrogateScriptPath
) {
    const {
        urlFilter,
        matchCase
    } = processPlaintextTrackerRule(trackerDomain, surrogateRule)

    const requestDomains = [trackerDomain]
    const excludedInitiatorDomains = getEntityDomains(tds, trackerDomain)

    return generateDNRRule({
        priority: PRIORITY,
        actionType: 'redirect',
        redirect: { extensionPath: surrogateScriptPath },
        urlFilter,
        matchCase,
        resourceTypes: ['script'],
        requestDomains,
        excludedInitiatorDomains
    })
}

/**
 * Generator to produce the declarativeNetRequest rules for "surrogate script"
 * redirection.
 * @param {object} tds
 *   The Tracker Blocking configuration.
 * @param {Record<string, Array<string, string>[]>} surrogatesConfig
 *   The "surrogate script" mapping configuration. Tracking domain -> array of
 *   rule + script path pairs.
 * @param {string} surrogatePathPrefix
 *   The path prefix for surrogate scripts, e.g. '/web_accessible_resources/'.
 * @return {Generator<[import('./utils').DNRRule, object]>}
 */
function* generateSurrogatesRules (tds, surrogatesConfig, surrogatePathPrefix) {
    for (const [domain, surrogates] of Object.entries(surrogatesConfig)) {
        const trackerDomain =
              getTrackerEntryDomain(tds.trackers, domain) || domain
        for (const [surrogateRule, surrogateScriptPath] of surrogates) {
            const rule = generateSurrogateDNRRule(
                tds, trackerDomain, surrogateRule,
                surrogatePathPrefix + surrogateScriptPath
            )
            const matchDetails = {
                type: 'surrogateScript',
                domain: trackerDomain,
                rule: surrogateRule
            }
            yield [rule, matchDetails]
        }
    }
}

exports.generateSurrogatesRules = generateSurrogatesRules
exports.PRIORITY = PRIORITY
