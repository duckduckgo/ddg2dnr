/** @module gpc */

const {
    resourceTypes 
} = require('./utils')

const GPC_HEADER_PRIORITY = 20000

const baseHeaderRule = {
    priority: GPC_HEADER_PRIORITY,
    action: {
        type: 'modifyHeaders',
        requestHeaders: [
            { header: 'Sec-GPC', operation: 'set', value: '1' }
        ]
    },
    condition: { resourceTypes: [...resourceTypes] }
}

function generateGPCheaderRules (config) {
    if (config.features?.gpc?.state !== 'enabled') {
        return []
    }

    const rule = baseHeaderRule

    if (config.features.gpc.exceptions) {
        const domains = config.features.gpc.exceptions.map(e => e.domain)
        rule.condition.excludedRequestDomains = domains
        rule.condition.excludedInitiatorDomains = domains
    }

    return [{ matchDetails: { type: 'gpc' }, rule }]
}

exports.generateGPCheaderRules = generateGPCheaderRules
exports.GPC_HEADER_PRIORITY = GPC_HEADER_PRIORITY
