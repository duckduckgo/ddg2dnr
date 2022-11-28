const { CEILING_PRIORITY } = require('./trackerAllowlist')
const { generateTrackerDomainAliasMapping, getTrackerEntryDomain, storeInLookup } = require('./utils')

const COOKIE_PRIORITY = CEILING_PRIORITY + 100

/**
 * Build HTTP cookie blocking rules from the blocklist and cookie configuration
 * @param {import('./utils').TDS} tds The tracker blocklist
 * @param {string[]} excludedCookieDomains 3p domains for which we shouldn't block cookies
 * @param {string[]} siteAllowlist Sites on which we shouldn't block 3p cookies
 * @returns {import('./utils').DNRRule[]} Cookie blocking rules
 */
function generateCookieBlockingRuleset (tds, excludedCookieDomains, siteAllowlist, startingRuleId = 1) {
    /**
     * @type {import('./utils').DNRRule[]}
     */
    const rules = []
    /**
     * @type {Map<string, { domains: Set<string>, trackerDomains: Set<string> }>}
     */
    const entityDomainMapping = new Map()
    /**
     * @type {Map<string, string[]>}
     */
    const trackerDomainExclusions = new Map()
    const singleDomainEntityDomains = []
    // collect CNAMEs for each tracker
    const requestDomainsByTrackerDomain = generateTrackerDomainAliasMapping(tds)

    // process exclusions: find their tracker domain so we know which rule to put it in
    excludedCookieDomains.forEach(d => {
        const trackerEntryDomain = getTrackerEntryDomain(tds.trackers, d)
        storeInLookup(trackerDomainExclusions, trackerEntryDomain, [d])
    })

    // Gather trackers by owner and build the set of owned and owned tracker domains for each
    for (const [trackerDomain, trackerEntry] of Object.entries(tds.trackers)) {
        const mapEntry = entityDomainMapping.get(trackerEntry.owner.name) || { domains: new Set(), trackerDomains: new Set() }

        requestDomainsByTrackerDomain.get(trackerDomain)?.forEach(d => {
            mapEntry.domains.add(d)
            mapEntry.trackerDomains.add(d)
        })
        tds.entities[trackerEntry.owner.name].domains.forEach(d => mapEntry.domains.add(d))

        entityDomainMapping.set(trackerEntry.owner.name, mapEntry)
    }

    for (const [, { domains, trackerDomains }] of entityDomainMapping.entries()) {
        // find if domains are excluded for this entity
        const excludedRequestDomains = []
        trackerDomains.forEach(d => {
            if (trackerDomainExclusions.has(d)) {
                excludedRequestDomains.push(...trackerDomainExclusions.get(d) || [])
            }
        })
        if (domains.size === 1 && trackerDomains.size === 1 && excludedRequestDomains.length === 0) {
            singleDomainEntityDomains.push(...domains)
            continue
        }
        rules.push({
            id: startingRuleId++,
            priority: COOKIE_PRIORITY,
            action: {
                type: 'modifyHeaders',
                requestHeaders: [{ header: 'cookie', operation: 'remove' }],
                responseHeaders: [{ header: 'set-cookie', operation: 'remove' }]
            },
            condition: {
                requestDomains: [...trackerDomains],
                excludedInitiatorDomains: [...domains, ...siteAllowlist],
                excludedRequestDomains
            }
        })
    }
    // create a single rule for all domains which only have 1 domain
    if (singleDomainEntityDomains.length > 0) {
        rules.push({
            id: startingRuleId++,
            priority: COOKIE_PRIORITY,
            action: {
                type: 'modifyHeaders',
                requestHeaders: [{ header: 'cookie', operation: 'remove' }],
                responseHeaders: [{ header: 'set-cookie', operation: 'remove' }]
            },
            condition: {
                requestDomains: singleDomainEntityDomains,
                excludedInitiatorDomains: siteAllowlist,
                domainType: 'thirdParty'
            }
        })
    }

    return rules
}

exports.generateCookieBlockingRuleset = generateCookieBlockingRuleset
