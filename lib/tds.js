/** @module tds */

const { generateTrackerBlockingRuleset } = require('./trackerBlocking')
const { generateSurrogatesRules } = require('./surrogates')

/**
 * @typedef {object} generateTdsRulesetResult
 * @property {import('./utils.js').DNRRule[]} ruleset
 *   The generated declarativeNetRequest ruleset.
 * @property {object} matchDetailsByRuleId
 *   Rule ID -> match details.
 */

/**
 * Generated an extension configuration declarativeNetRequest ruleset.
 * @param {object} tds
 *   The Tracker Blocking configuration.
 * @param {Record<string, Array<string, string>[]>} surrogatesConfig
 *   The "surrogate script" mapping configuration. Tracking domain -> array of
 *   rule + script path pairs.
 * @param {string} surrogatePathPrefix
 *   The path prefix for surrogate scripts, e.g. '/web_accessible_resources/'.
 * @param {function} isRegexSupported
 *   A function compatible with chrome.declarativeNetRequest.isRegexSupported.
 *   See https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/#method-isRegexSupported
 * @param {number} [startingRuleId = 1]
 *   Rule ID for the generated declarativeNetRequest rules to start from. Rule
 *   IDs are incremented sequentially from the starting point.
 * @return {Promise<generateTdsRulesetResult>}
 */
async function generateTdsRuleset (
    tds, surrogatesConfig, surrogatePathPrefix, isRegexSupported,
    startingRuleId = 1
) {
    if (typeof isRegexSupported !== 'function') {
        throw new Error('Missing isRegexSupported function.')
    }

    // Tracker blocking.
    const {
        ruleset,
        matchDetailsByRuleId
    } = await generateTrackerBlockingRuleset(
        tds, isRegexSupported, startingRuleId
    )

    let ruleId = startingRuleId + ruleset.length

    // Surrogate scripts.
    for (const result of generateSurrogatesRules(
        tds, surrogatesConfig, surrogatePathPrefix
    )) {
        if (!result) continue

        const [rule, matchDetails] = result
        rule.id = ruleId++
        ruleset.push(rule)
        matchDetailsByRuleId[rule.id] = matchDetails
    }

    return { ruleset, matchDetailsByRuleId }
}

exports.generateTdsRuleset = generateTdsRuleset
