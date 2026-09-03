# Test coverage

What this suite checks and why, for a reviewer who has not read the code.
Setup, configuration and how to run things live in [README.md](README.md).

These are **smoke tests against the live funda.nl**, not unit tests. They assert
that the main journeys work and that data stays consistent as a user moves
between pages. They do not assert exact copy, prices or listing identity —
funda.nl's inventory changes hourly, so anything pinned to a specific home would
be red by tomorrow.

## At a glance

| | Test runs | Executed | Skipped | Not written |
|---|---:|---:|---:|---:|
| `desktop-chrome` | 61 | 55 | 6 | – |
| `mobile-chrome` | 16 | 1 | – | 15 |
| **Total** | **77** | **56** | **6** | **15** |

Two projects are defined in `playwright.config.ts`: `desktop-chrome` runs
`tests/desktop/`, `mobile-chrome` runs `tests/mobile/` on an iPhone 17 Pro
viewport. A `desktop-safari` project is present but commented out — a few tests
fail on WebKit for engine-specific reasons rather than site defects, and a partly
red cross-browser run is worse than a smaller green one.

### Why the run count is higher than the number of tests written

Most specs are data-driven, so one written test produces several runs. Two search
scenarios are defined once in `src/pages/types.ts` and reused across four specs:

| Scenario | Search type | Area |
|---|---|---|
| Buy | `koop` | `amsterdam` (city name) |
| Rent | `huur` | `1071` (postcode) |

The pair is deliberate: it covers both sides of the site (sale and rental, which
render prices and filters differently) and both ways a user can search (by place
name and by postcode).

| Spec | Written | × scenarios | × modes | Runs |
|---|---:|---:|---:|---:|
| `searchResults` | 7 | 2 | – | 14 |
| `listingDetail` | 5 | 2 | – | 10 |
| `agentSectionListingDetails` | 4 | 2 | – | 8 |
| `agentContact` | 5 | 2 | 2 | 20 |

`agentContact` multiplies again by the two ways a user reaches the enquiry form —
the plain "contact the agent" link and the "request a viewing" call to action —
because the form differs between them.

## Coverage by area

### Main page — `tests/desktop/mainPage.spec.ts` (8 runs)

The entry point: does the homepage render, and does every route off it go
somewhere sensible?

| Test | What it proves |
|---|---|
| Validate visually main page layout | Full-page screenshot against a committed baseline. Catches layout regressions no assertion is written for. The advertising slot is masked out. |
| Searching by `koop` `amsterdam` / `huur` `1071` | Typing a place and pressing Enter reaches `/zoeken/`. Runs for both a city name and a postcode. |
| Map search link | Reaches `/zoeken/kaart/`. |
| Agent search link | Reaches `/makelaar-zoeken`. |
| Business portal link | Opens **in a new tab** on `fundainbusiness.nl` — the assertion waits for the new page, so a link that silently navigated in place would fail. |
| Featured section shows a full carousel | The "Woning in beeld" block exists and holds exactly 3 cards. |
| Each featured card is complete | Every card carries a detail link, image `srcset`, price, street, city and agent — each present and non-empty. Catches half-rendered cards, which a visible-check would pass. |

### Search results — `tests/desktop/searchResults.spec.ts` (14 runs)

| Test | What it proves |
|---|---|
| Returns a non-empty set of results | The result count parses to a number greater than zero, cards render, the page header names the searched area, and **every address returned is actually in that area** — a search that quietly fell back to all of funda would fail. |
| Offers the controls needed to refine | Filters, sort and map-view controls are present. |
| Address, price and agent on every card | For each card: street non-empty; postcode-and-city matches `1234 AB City`; the detail URL points at the right listing type; the price is in euros; the agent name and profile link are present. |
| Renders the "Toppositie" placement | The paid placement block appears **and** organic results still render alongside it. |
| Next page loads different results | Pagination is visible, and page two is neither empty nor a repeat of page one. |
| Clicking a result opens its detail page | Navigation lands on `/detail/<type>/`. |
| Map view renders the same search | The map URL keeps the searched area and the map region is visible. |

Price parsing is the fiddly part here: a rental card reads `€ 3.500 p.m.` and a
sale card `€ 450.000 k.k.`, so the spec picks the price carrying the suffix that
matches the search type rather than the first euro amount on the card.

### Search filters — `tests/desktop/searchResultsFilters.spec.ts` (1 run)

One end-to-end filter journey, buy in Amsterdam under €500,000:

1. Opens the filter panel and records what the apply button currently promises.
2. Ticks *house* and sets a maximum price.
3. Asserts the promised count **changed** — proof the panel reacted, rather than
   asserting a hardcoded number that would drift.
4. Asserts the promise is still greater than zero, so the rest of the test is
   meaningful.
5. Applies, then checks both filters landed in the URL.
6. Checks the results page shows **the same count the panel promised** — this is
   the real point of the test.
7. Checks every returned card is genuinely at or under the price cap.

### Listing detail — `tests/desktop/listingDetail.spec.ts` (10 runs, 2 skipped)

| Test | What it proves |
|---|---|
| Result card and listing page have the same data | Opens a listing from the results list and checks the street, postcode-and-city and **price amount** on the detail page match the card it came from. Catches the class of bug where a card links to the wrong home. |
| Listing data present and correctly formatted | Postcode matches the Dutch format, the listing is in the searched area, house number present, price in euros, living area in m², and an energy label in A–G — legally required on every Dutch listing, so its absence is a real defect. |
| Media gallery and description | The photos link is visible and carries a count; the description renders and is longer than 100 characters, catching a truncated or empty body. |
| Features section | The core categories (`overdracht`, `bouw`, `afmetingen`, `energie`) are all present, and the price repeated under *Overdracht* matches the header price. |
| *(skipped)* Comparable listings block | See [Deliberately not covered](#deliberately-not-covered). |

### Estate agent section — `tests/desktop/agentSectionListingDetails.spec.ts` (8 runs)

The agent block on a listing page, opened from a known result card.

| Test | What it proves |
|---|---|
| Same agent as the card it came from | Agency name matches, and the **profile ID in the URL** matches — a stronger check than the name, since agencies share names. |
| Branding and both profile links | The logo renders with a real source, and the logo and the agency name link to the same profile. |
| Phone number revealed on request | The number starts hidden behind a reveal control, and after clicking becomes visible as a dialable `tel:` link. Funda hides it deliberately, so both halves matter. |
| Viewing request call to action | Visible, labelled, and its URL references **this listing's** global ID. Asserted, never clicked. |

### Agent contact form — `tests/desktop/agentContact.spec.ts` (20 runs, 4 skipped)

Runs for both scenarios × both entry points (plain contact, viewing request).

| Test | What it proves |
|---|---|
| Opens for the listing being viewed | The form URL carries the listing's global ID, and the heading matches the entry point — "Neem contact op met de makelaar" versus "Plan een bezichtiging". |
| Describes the listing the enquiry is about | Street, postcode-and-city and price on the form match the original result card, the summary links back to the listing, and the agency shown is the same one. Proves the enquiry is attached to the right home. |
| Presents a complete enquiry form | Message, email, first name, last name and phone are all visible **and editable**; submit is visible and enabled. Mortgage advice is offered on a `koop` enquiry and absent on `huur`. |
| Offers / does not offer viewing preferences | Arriving via "request a viewing" pre-checks the viewing request and offers all five days and both dayparts. Arriving via plain contact offers none of it. |
| *(skipped)* Submits and confirms | See below. |

## Deliberately not covered

Three gaps are marked in the suite rather than left silent. They show up in the
HTML report, so nothing is quietly missing.

**`test.skip` — runnable, deliberately not run.**

- **Submitting the enquiry form** (4 runs). Submitting puts a real enquiry in a
  real estate agent's inbox. The test is written out in full as a specification —
  fill the fields, choose viewing preferences, submit, confirm — and stops there.
  `AgentContactForm.clickSubmit()` throws rather than clicking, so it can never
  pass silently if someone un-skips it. The confirmation locator is a guess and
  is commented as such: the success state has never been observed, and whoever
  runs this against staging should replace it with what the page actually shows.
- **Comparable listings block** (2 runs). "Vergelijkbaar in de buurt" has two
  equally valid states — a carousel, or an empty state when nothing comparable is
  nearby — and which one appears depends on whichever listing sits at that
  position that day. Asserting one of them would be flaky by construction.
  Covering it properly needs the empty state's markup, which has not been
  inspected.

**`test.fixme` — not written yet.** `tests/mobile/planned.spec.ts` holds 15
entries naming the mobile coverage this suite is missing. The titles mirror the
desktop specs one for one, so the two suites can be read side by side. They are
`fixme` rather than `skip` to keep the distinction honest: *not written* is not
the same as *deliberately not run*.

The mobile layout hides navigation behind a hamburger menu and moves filters into
a full-screen sheet, so these need their own locators — the desktop page objects
do not carry over. Only one mobile test is implemented: a visual check of the
main page, with the advertising slot and the featured carousel masked out.

## How the suite is put together

Enough to navigate the code, not a tour of it.

```
src/
  fixture/base.ts      Custom fixtures: home, searchResults, listingDetail, agentContact
  pages/               One page object per page
  components/          Blocks reused across pages: agent section, contact form, filters
  routes.ts            URL builders
  utils.ts             Price and agent-ID parsing
tests/
  desktop/             Run by the desktop-chrome project
  mobile/              Run by the mobile-chrome project
```

Two things worth knowing when reading a failure:

- **Consent and survey pop-ups are handled globally**, in the `page` fixture via
  `addLocatorHandler`. No test dismisses a banner itself, so a banner appearing
  mid-test does not fail it.
- **Actions are wrapped in `test.step`**, so the HTML report and trace read as a
  journey ("Open koop search results for amsterdam" → "Open the listing at
  position 1") rather than a list of clicks.

Assertions carry messages describing the expectation, so a failure in the report
states what should have been true without needing the source open.
