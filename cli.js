import * as fs from 'fs'
import * as process from 'process'

import { PuppeteerInterface } from './puppeteerInterface.js'

import { generateSmarterEncryptionRuleset } from './lib/smarterEncryption.js'
import { generateTrackerBlockingRuleset } from './lib/trackerBlocking.js'
import {
    generateExtensionConfigurationRuleset
} from './lib/extensionConfiguration.js'

const [command, ...args] = process.argv.slice(2)

async function main () {
    switch (command) {
    case 'smarter-encryption':
        if (args.length !== 2) {
            console.error(
                'Usage: npm run smarter-encryption',
                './domains-list-input.txt ./ruleset-output.json'
            )
        } else {
            const [domainsFilePath, rulesetFilePath] = args
            fs.writeFileSync(
                rulesetFilePath,
                JSON.stringify(
                    generateSmarterEncryptionRuleset(
                        fs.readFileSync(
                            domainsFilePath,
                            { encoding: 'utf8' }
                        ).split('\n')
                    ),
                    null,
                    '\t'
                )
            )
        }
        break
    case 'tracker-blocking':
        if (args.length < 2 || args.length > 3) {
            console.error(
                'Usage: npm run tracker-blocking',
                './tds-input.json ./ruleset-output.json',
                '[./domain-by-rule-id-output.txt]'
            )
        } else {
            const [tdsFilePath, rulesetFilePath, mappingFilePath] = args

            const browser = new PuppeteerInterface()
            const isRegexSupported = browser.isRegexSupported.bind(browser)

            const { ruleset, trackerDomainByRuleId } =
                  await generateTrackerBlockingRuleset(
                      JSON.parse(
                          fs.readFileSync(tdsFilePath, { encoding: 'utf8' })
                      ),
                      isRegexSupported
                  )

            browser.closeBrowser()

            fs.writeFileSync(
                rulesetFilePath,
                JSON.stringify(ruleset, null, '\t')
            )

            if (mappingFilePath) {
                fs.writeFileSync(
                    mappingFilePath,
                    trackerDomainByRuleId.join('\n')
                )
            }
        }
        break
    case 'extension-configuration':
        if (args.length < 2 || args.length > 3) {
            console.error(
                'Usage: npm run extension-configuration',
                './extension-config-input.json ./ruleset-output.json ',
                '[./domain-and-reason-by-rule-id-output.json]'
            )
        } else {
            const [
                extensionConfigFilePath, rulesetFilePath, mappingFilePath
            ] = args

            const browser = new PuppeteerInterface()
            const isRegexSupported = browser.isRegexSupported.bind(browser)

            const { ruleset, matchDetailsByRuleId } =
                  await generateExtensionConfigurationRuleset(
                      JSON.parse(
                          fs.readFileSync(
                              extensionConfigFilePath, { encoding: 'utf8' }
                          )
                      ),
                      isRegexSupported
                  )

            browser.closeBrowser()

            fs.writeFileSync(
                rulesetFilePath,
                JSON.stringify(ruleset, null, '\t')
            )

            if (mappingFilePath) {
                fs.writeFileSync(
                    mappingFilePath,
                    JSON.stringify(matchDetailsByRuleId, null, '\t')
                )
            }
        }
        break

    default:
        console.error('Unknown command!')
    }
}

main()
