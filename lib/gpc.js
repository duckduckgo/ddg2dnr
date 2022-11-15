/** @module gpc */
const {
    GPC_HEADER_PRIORITY
} = require('./rulePriorities')

const resourceTypes = new Set([
    'main_frame', 'sub_frame', 'stylesheet', 'script', 'image', 'font',
    'object', 'xmlhttprequest', 'ping', 'csp_report', 'media', 'websocket',
    'webtransport', 'webbundle', 'other'
])

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
