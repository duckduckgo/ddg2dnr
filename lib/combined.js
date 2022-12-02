import { generateCookieBlockingRuleset } from './cookies'

/**
 * Build blocklist rules which depend on both the privacy configuration and blocklist. This
 * currently covers:
 *   - cookie header blocking
 * @param {import('./utils').TDS} tds The tracker blocklist
 * @param {import('./utils').PrivacyConfiguration} config Privacy config
 * @param {string[]} denylistedDomains
 *   Domains that the user has specifically denylisted. These domains should be
 *   excluded from any contentBlocking/unprotectedTemporary allowlisting rules.
 * @returns {import('./utils').RulesetResult}
 */
function generateCombinedConfigBlocklistRuleset (tds, config, denylistedDomains) {
    // Merge cookie feature exceptions with unprotectedTemporary, then remove any denylisted domains
    const cookieAllowlist = (config.features.cookie?.exceptions.map(entry => entry.domain) || [])
        .concat(config.unprotectedTemporary.map(entry => entry.domain))
        .filter(domain => denylistedDomains.includes(domain))
    const excludedCookieDomains = config.features.cookie?.settings.excludedCookieDomains.map(entry => entry.domain)
    return generateCookieBlockingRuleset(tds, excludedCookieDomains, cookieAllowlist)
}

exports.generateCombinedConfigBlocklistRuleset = generateCombinedConfigBlocklistRuleset
