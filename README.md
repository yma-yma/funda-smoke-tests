# funda.nl — smoke test suite

Automated smoke tests for funda.nl, written with Playwright and TypeScript.

**[TESTS.md](TESTS.md) describes what the suite covers** — every test, what it
proves, and what is deliberately left out. This file covers setup and running.

## Requirements

- **Node.js 20 LTS or newer** (`node --version`)
- **npm** (ships with Node)
- A **funda.nl bypass user agent**, provided with the assignment — see [Configuration](#configuration)

## Setup

```bash
git clone <repository-url>
cd funda-smoke-tests
npm install
npx playwright install chromium webkit
```

`npm install` pulls in `@playwright/test`, `dotenv` and the TypeScript toolchain.
`npx playwright install` downloads the browser engines themselves — they are not
part of the npm package. Only the engines the projects actually use are listed;
drop `webkit` if you remove the Safari projects.

## Configuration

funda.nl serves a bot-verification page ("Je bent bijna op de pagina die je
zoekt") to unrecognised clients, so every request has to carry the user agent
supplied with the assignment. It is read from the environment and never
committed.

Create a `.env` file in the project root, next to `playwright.config.ts`:

```dotenv
BASE_URL=https://www.funda.nl
FUNDA_USER_AGENT="paste the user agent here"
```

`.env` is listed in `.gitignore` and has never been committed.

If `FUNDA_USER_AGENT` is missing, `playwright.config.ts` throws before any
browser starts:

```
FUNDA_USER_AGENT is not set. Please set it in the .env file or as an environment variable.
```

## Running the tests

```bash
npm test                       # every project
npm run test:ui                # Playwright UI mode, best for debugging locators
npm run test:headed            # watch the browser while tests run
npm run report                 # open the HTML report from the last run
npm run test:update-snapshots  # regenerate the visual baselines
```

Anything narrower goes through the Playwright CLI directly.

A single project:

```bash
npx playwright test --project=desktop-chrome
npx playwright test --project=mobile-chrome
```

A single file, or a single test by name:

```bash
npx playwright test tests/desktop/searchResults.spec.ts
npx playwright test -g "Should return a non-empty set of results"
```

## Visual tests

Two tests compare a screenshot against a committed baseline. Baselines live in
`visual-baseline/` and **are** part of the repository — without them there is
nothing to compare against.

They are platform- and project-specific: the filename carries both, because font
rendering differs between engines and operating systems. The committed baselines
were captured on macOS. **Running the suite on Linux or Windows for the first
time will report a missing snapshot and write a new one** — that is expected, not
a failure of the site.

To regenerate after an intentional UI change:

```bash
npm run test:update-snapshots
```

Then open the generated PNG and check it before committing. A baseline captured
from a broken page — an error screen, or the bot-verification page — will make
every later run pass against the wrong reference.

## What is not committed

```
.env                 # the user agent
node_modules/
test-results/        # traces, videos and error context from the last run
playwright-report/   # the generated HTML report
screenshots/         # screenshots captured from failing tests
```