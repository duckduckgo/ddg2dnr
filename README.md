# ddg2dnr

## Introduction

This is a library and command line utility to generate the [declarativeNetRequest][1]
rulesets necessary for the [DuckDuckGo Privacy Essentials extension][2].


## Setup

Install the dependencies:

```bash
npm install
```

## Usage

### Command line

Generate a Smarter Encryption ruleset:

```bash
npm run smarter-encryption ../list-of-domains-input.txt ../smarter-encryption-ruleset-output.json
```

Generate the TDS ruleset:

```bash
npm run tds ../tds-input.json analytics.js,ga.js,gpt.js ../tds-ruleset-output.json \
        [../match-details-by-rule-id-output.json]
```

Note:
 - This includes both Tracker blocking (see [tds.json][3]) and
   "surrogate script" redirection. (see [tracker-surrogates][4]).
 - The second argument is a comma separated list of supported
   surrogate scripts. Note that "analytics.js,ga.js,gpt.js" is
   just an example, see the [tracker-surrogates][4] repository
   for a full list of available surrogate scripts. If you don't
   want to support any surrogate scripts, just use a placeholder
   value e.g. "-".

Generate the extension configuration ruleset:

```bash
npm run extension-configuration ../extension-config-input.json \
        ../extension-configuration-ruleset-output.json [../match-details-by-rule-id-output.json]
```

## Development

Lint the code:

```bash
npm run lint
```

Run the tests:

```bash
npm test
```

[1]: https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/
[2]: https://github.com/duckduckgo/duckduckgo-privacy-extension/
[3]: https://staticcdn.duckduckgo.com/trackerblocking/v3/tds.json
[4]: https://github.com/duckduckgo/tracker-surrogates/
