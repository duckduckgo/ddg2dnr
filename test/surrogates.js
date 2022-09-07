const assert = require('assert')

const {
    PRIORITY
} = require('../lib/surrogates')

const {
    generateTdsRuleset
} = require('../lib/tds')

async function isRegexSupportedTrue ({ regex, isCaseSensitive }) {
    return { isSupported: true }
}

const googleTrackerEntry = {
    owner: {
        name: 'Google LLC',
        displayName: 'Google',
        privacyPolicy: 'https://policies.google.com/privacy?hl=en&gl=us',
        url: 'http://google.com'
    },
    prevalence: 0.691,
    fingerprinting: 2,
    cookies: 0.619,
    categories: [],
    default: 'allow',
    rules: []
}

const tds = {
    cnames: {},
    domains: {
        'google-analytics.com': googleTrackerEntry.owner.name,
        'googletagmanager.com': googleTrackerEntry.owner.name,
        'googletagservices.com': googleTrackerEntry.owner.name,
        'googlesyndication.com': googleTrackerEntry.owner.name,
        'doubleclick.net': googleTrackerEntry.owner.name,
        'scorecardresearch.com': 'comScore, Inc',
        'outbrain.com': 'Outbrain'
    },
    entities: {
        'Google LLC': {
            domains: [
                'doubleclick.net',
                'google.com',
                'google-analytics.com',
                'googletagservices.com',
                'googlesyndication.com'
            ],
            prevalence: 79.9,
            displayName: 'Google'
        },
        // 'comScore, Inc' omitted deliberately.
        Outbrain: {
            // domains omitted deliberately.
            prevalence: 79.9,
            displayName: 'Outbrain'
        }
    },
    trackers: {
        'google-analytics.com': googleTrackerEntry,
        'googletagmanager.com': googleTrackerEntry,
        'googletagservices.com': googleTrackerEntry,
        'googlesyndication.com': googleTrackerEntry,
        'doubleclick.net': googleTrackerEntry,
        'scorecardresearch.com': {
            owner: {
                name: 'comScore, Inc',
                displayName: 'comScore',
                privacyPolicy: 'https://www.comscore.com/About/Privacy-Policy',
                url: 'http://comscore.com'
            },
            prevalence: 0.102,
            fingerprinting: 2,
            cookies: 0.0974,
            categories: [],
            default: 'allow',
            rules: []
        },
        'outbrain.com': {
            owner: {
                name: 'Outbrain',
                displayName: 'Outbrain',
                privacyPolicy: 'https://www.outbrain.com/legal/privacy',
                url: 'http://outbrain.com'
            },
            prevalence: 0.0861,
            fingerprinting: 2,
            cookies: 0.079,
            categories: [],
            default: 'allow',
            rules: []
        }
    }
}

const surrogatesConfig = {
    'google-analytics.com': [
        ['google-analytics.com/ga.js', 'ga.js'],
        ['google-analytics.com/analytics.js', 'analytics.js']
    ],
    'googletagmanager.com': [
        ['googletagmanager.com/gtm.js', 'gtm.js']
    ],
    'googletagservices.com': [
        ['googletagservices.com/gpt.js', 'gpt.js'],
        ['googletagservices.com/tag/js/gpt.js', 'gpt.js']
    ],
    'googlesyndication.com': [
        ['googlesyndication.com/adsbygoogle.js', 'adsbygoogle.js'],
        ['googlesyndication.com/pagead/js/adsbygoogle.js', 'adsbygoogle.js']
    ],
    'doubleclick.net': [
        ['doubleclick.net/instream/ad_status.js', 'ad_status.js'],
        ['doubleclick.net/tag/js/gpt.js', 'gpt.js']
    ],
    'scorecardresearch.com': [
        ['scorecardresearch.com/beacon.js', 'beacon.js']
    ],
    'outbrain.com': [
        ['outbrain.com/outbrain.js', 'outbrain.js']
    ]
}

describe('Surrogates', () => {
    it('should return no rules if surrogate configuration is ' +
       'empty', async () => {
        assert.deepEqual(
            await generateTdsRuleset(
                tds, {}, '/path_prefix/', isRegexSupportedTrue
            ),
            { ruleset: [], matchDetailsByRuleId: {} }
        )
    })

    it('should generate surrogate redirection rules correctly', async () => {
        const tdsCopy = JSON.parse(JSON.stringify(tds))
        const surrogatesConfigCopy =
              JSON.parse(JSON.stringify(surrogatesConfig))

        assert.deepEqual(
            await generateTdsRuleset(
                tds, surrogatesConfig, '/path_prefix/', isRegexSupportedTrue, 13
            ),
            {
                ruleset: [
                    {
                        id: 13,
                        priority: PRIORITY,
                        action: {
                            type: 'redirect',
                            redirect: {
                                extensionPath: '/path_prefix/ga.js'
                            }
                        },
                        condition: {
                            urlFilter: '||google-analytics.com/ga.js',
                            isUrlFilterCaseSensitive: false,
                            excludedInitiatorDomains: [
                                'doubleclick.net',
                                'google.com',
                                'google-analytics.com',
                                'googletagservices.com',
                                'googlesyndication.com'
                            ],
                            resourceTypes: ['script']
                        }
                    },
                    {
                        id: 14,
                        priority: PRIORITY,
                        action: {
                            type: 'redirect',
                            redirect: {
                                extensionPath: '/path_prefix/analytics.js'
                            }
                        },
                        condition: {
                            urlFilter: '||google-analytics.com/analytics.js',
                            isUrlFilterCaseSensitive: false,
                            excludedInitiatorDomains: [
                                'doubleclick.net',
                                'google.com',
                                'google-analytics.com',
                                'googletagservices.com',
                                'googlesyndication.com'
                            ],
                            resourceTypes: ['script']
                        }
                    },
                    {
                        id: 15,
                        priority: PRIORITY,
                        action: {
                            type: 'redirect',
                            redirect: {
                                extensionPath: '/path_prefix/gtm.js'
                            }
                        },
                        condition: {
                            urlFilter: '||googletagmanager.com/gtm.js',
                            isUrlFilterCaseSensitive: false,
                            excludedInitiatorDomains: [
                                'doubleclick.net',
                                'google.com',
                                'google-analytics.com',
                                'googletagservices.com',
                                'googlesyndication.com'
                            ],
                            resourceTypes: ['script']
                        }
                    },
                    {
                        id: 16,
                        priority: PRIORITY,
                        action: {
                            type: 'redirect',
                            redirect: {
                                extensionPath: '/path_prefix/gpt.js'
                            }
                        },
                        condition: {
                            urlFilter: '||googletagservices.com/gpt.js',
                            isUrlFilterCaseSensitive: false,
                            excludedInitiatorDomains: [
                                'doubleclick.net',
                                'google.com',
                                'google-analytics.com',
                                'googletagservices.com',
                                'googlesyndication.com'
                            ],
                            resourceTypes: ['script']
                        }
                    },
                    {
                        id: 17,
                        priority: PRIORITY,
                        action: {
                            type: 'redirect',
                            redirect: {
                                extensionPath: '/path_prefix/gpt.js'
                            }
                        },
                        condition: {
                            urlFilter: '||googletagservices.com/tag/js/gpt.js',
                            isUrlFilterCaseSensitive: false,
                            excludedInitiatorDomains: [
                                'doubleclick.net',
                                'google.com',
                                'google-analytics.com',
                                'googletagservices.com',
                                'googlesyndication.com'
                            ],
                            resourceTypes: ['script']
                        }
                    },
                    {
                        id: 18,
                        priority: PRIORITY,
                        action: {
                            type: 'redirect',
                            redirect: {
                                extensionPath: '/path_prefix/adsbygoogle.js'
                            }
                        },
                        condition: {
                            urlFilter: '||googlesyndication.com/adsbygoogle.js',
                            isUrlFilterCaseSensitive: false,
                            excludedInitiatorDomains: [
                                'doubleclick.net',
                                'google.com',
                                'google-analytics.com',
                                'googletagservices.com',
                                'googlesyndication.com'
                            ],
                            resourceTypes: ['script']
                        }
                    },
                    {
                        id: 19,
                        priority: PRIORITY,
                        action: {
                            type: 'redirect',
                            redirect: {
                                extensionPath: '/path_prefix/adsbygoogle.js'
                            }
                        },
                        condition: {
                            urlFilter: '||googlesyndication.com/pagead/js/adsbygoogle.js',
                            isUrlFilterCaseSensitive: false,
                            excludedInitiatorDomains: [
                                'doubleclick.net',
                                'google.com',
                                'google-analytics.com',
                                'googletagservices.com',
                                'googlesyndication.com'
                            ],
                            resourceTypes: ['script']
                        }
                    },
                    {
                        id: 20,
                        priority: PRIORITY,
                        action: {
                            type: 'redirect',
                            redirect: {
                                extensionPath: '/path_prefix/ad_status.js'
                            }
                        },
                        condition: {
                            urlFilter: '||doubleclick.net/instream/ad_status.js',
                            isUrlFilterCaseSensitive: false,
                            excludedInitiatorDomains: [
                                'doubleclick.net',
                                'google.com',
                                'google-analytics.com',
                                'googletagservices.com',
                                'googlesyndication.com'
                            ],
                            resourceTypes: ['script']
                        }
                    },
                    {
                        id: 21,
                        priority: PRIORITY,
                        action: {
                            type: 'redirect',
                            redirect: {
                                extensionPath: '/path_prefix/gpt.js'
                            }
                        },
                        condition: {
                            urlFilter: '||doubleclick.net/tag/js/gpt.js',
                            isUrlFilterCaseSensitive: false,
                            excludedInitiatorDomains: [
                                'doubleclick.net',
                                'google.com',
                                'google-analytics.com',
                                'googletagservices.com',
                                'googlesyndication.com'
                            ],
                            resourceTypes: ['script']
                        }
                    },
                    {
                        id: 22,
                        priority: PRIORITY,
                        action: {
                            type: 'redirect',
                            redirect: {
                                extensionPath: '/path_prefix/beacon.js'
                            }
                        },
                        condition: {
                            urlFilter: '||scorecardresearch.com/beacon.js',
                            isUrlFilterCaseSensitive: false,
                            domainType: 'thirdParty',
                            resourceTypes: ['script']
                        }
                    },
                    {
                        id: 23,
                        priority: PRIORITY,
                        action: {
                            type: 'redirect',
                            redirect: {
                                extensionPath: '/path_prefix/outbrain.js'
                            }
                        },
                        condition: {
                            urlFilter: '||outbrain.com/outbrain.js',
                            isUrlFilterCaseSensitive: false,
                            domainType: 'thirdParty',
                            resourceTypes: ['script']
                        }
                    }
                ],
                matchDetailsByRuleId: {
                    13: {
                        type: 'surrogateScript',
                        domain: 'google-analytics.com',
                        rule: 'google-analytics.com/ga.js'
                    },
                    14: {
                        type: 'surrogateScript',
                        domain: 'google-analytics.com',
                        rule: 'google-analytics.com/analytics.js'
                    },
                    15: {
                        type: 'surrogateScript',
                        domain: 'googletagmanager.com',
                        rule: 'googletagmanager.com/gtm.js'
                    },
                    16: {
                        type: 'surrogateScript',
                        domain: 'googletagservices.com',
                        rule: 'googletagservices.com/gpt.js'
                    },
                    17: {
                        type: 'surrogateScript',
                        domain: 'googletagservices.com',
                        rule: 'googletagservices.com/tag/js/gpt.js'
                    },
                    18: {
                        type: 'surrogateScript',
                        domain: 'googlesyndication.com',
                        rule: 'googlesyndication.com/adsbygoogle.js'
                    },
                    19: {
                        type: 'surrogateScript',
                        domain: 'googlesyndication.com',
                        rule: 'googlesyndication.com/pagead/js/adsbygoogle.js'
                    },
                    20: {
                        type: 'surrogateScript',
                        domain: 'doubleclick.net',
                        rule: 'doubleclick.net/instream/ad_status.js'
                    },
                    21: {
                        type: 'surrogateScript',
                        domain: 'doubleclick.net',
                        rule: 'doubleclick.net/tag/js/gpt.js'
                    },
                    22: {
                        type: 'surrogateScript',
                        domain: 'scorecardresearch.com',
                        rule: 'scorecardresearch.com/beacon.js'
                    },
                    23: {
                        type: 'surrogateScript',
                        domain: 'outbrain.com',
                        rule: 'outbrain.com/outbrain.js'
                    }
                }
            }
        )

        // Verify that the configuration wasn't mutated.
        assert.deepEqual(tds, tdsCopy)
        assert.deepEqual(surrogatesConfig, surrogatesConfigCopy)
    })
})
