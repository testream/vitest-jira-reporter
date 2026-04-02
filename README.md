# Vitest Jira Reporter: Send Vitest Test Results to Jira with Testream

This repository is a practical **Vitest + Jira integration example** using [`@testream/vitest-reporter`](https://docs.testream.app/reporters/vitest). It shows how to upload Vitest results from local runs and GitHub Actions so your team can inspect failed tests, trends, and release quality directly in Jira.

If you are searching for **"Vitest Jira reporter"**, **"Vitest GitHub Actions Jira integration"**, or **"send Vitest results to Jira"**, this repo is the implementation template.

## Why this example is useful

- **CI-ready**: Includes a working GitHub Actions workflow.
- **Jira-focused reporting**: Uses Testream to surface test insights in Jira.
- **Failure visibility**: Includes intentionally failing tests so you can see exactly how errors appear in dashboards.
- **Safe defaults**: Reporter uploads only when `TESTREAM_API_KEY` is configured.

## What is Testream?

[Testream](https://testream.app) is an automated test management and reporting platform for Jira teams. It ingests test results from native reporters (Vitest, Playwright, Jest, Cypress, and more), then provides failure inspection, historical trends, and release-level visibility inside Jira.

If this sample repository is not the framework you need, browse all native reporters in the Testream docs: <https://docs.testream.app/>.

### Watch Testream in action

Click to see how Testream turns raw CI test results into actionable Jira insights (failures, trends, and release visibility):  
[![Watch the video](https://img.youtube.com/vi/5sDao2Q8k1k/maxresdefault.jpg)](https://www.youtube.com/watch?v=5sDao2Q8k1k)

Install the **[Testream Automated Test Management and Reporting for Jira](https://marketplace.atlassian.com/apps/3048460704/testream-automated-test-management-and-reporting-for-jira)** app from Atlassian Marketplace to view uploaded results in your Jira workspace.

## Project structure

```text
src/
  cart.ts          - Cart class: add/remove items, calculate totals, checkout
  product.ts       - Product type, formatPrice, validateProduct, getDiscountedPrice
  discount.ts      - Coupon type, applyPercentage, applyFixed, validateCoupon
__tests__/
  cart.test.ts     - Cart tests (passing + 1 intentional failure)
  product.test.ts  - Product tests (passing + 1 intentional failure)
  discount.test.ts - Discount tests (passing + 1 intentional failure)
vitest.config.ts
.github/workflows/vitest.yml
.env.example
```

The three intentional failures help you verify that stack traces and assertion diffs are uploaded and visible in Testream/Jira.

## Quick start: Vitest Jira integration

### 1. Create your Testream project and API key

1. Sign in at [testream.app](https://testream.app).
2. Create a project.
3. Copy your API key.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Set at least:

```bash
TESTREAM_API_KEY=<your key>
```

### 4. Run tests locally

```bash
npm test
```

When `TESTREAM_API_KEY` is present, results upload automatically. Without a key, tests still run and no upload occurs.

## Vitest reporter configuration (important options)

Reporter setup lives in `vitest.config.ts`.

- `uploadEnabled` is derived from API key presence.
- `failOnUploadError` is `true` to avoid silently losing CI reporting.
- `testEnvironment`, `appName`, `appVersion`, and `testType` are explicit so run metadata is traceable.

Reporter docs: <https://docs.testream.app/reporters/vitest>

## GitHub Actions setup for Vitest reporting to Jira

The workflow in `.github/workflows/vitest.yml` runs on push and pull request.

Add this repository secret:

**Settings -> Secrets and variables -> Actions -> New repository secret**

| Name | Value |
|---|---|
| `TESTREAM_API_KEY` | Your Testream API key |

Workflow environment variables already included:

| Variable | Example |
|---|---|
| `TESTREAM_TEST_ENVIRONMENT` | `ci` |
| `TESTREAM_APP_VERSION` | `${{ github.sha }}` |

## How results appear in Jira

After uploads are enabled and your Testream project is connected to Jira, you get:

- **Dashboard** for pass rate and run health
- **Failure insights** with full error + stack trace + diff
- **Trend analytics** for pass/fail and duration over time
- **Suite change tracking** for added/removed tests
- **Release visibility** mapped to Jira releases
- **Issue creation from failures** with context prefilled

## Troubleshooting Vitest + Jira uploads

### No uploads from local runs

- Confirm `TESTREAM_API_KEY` is set in `.env`.
- Ensure `.env` is loaded in your shell/session before running tests.

### No uploads from GitHub Actions

- Confirm `TESTREAM_API_KEY` exists in repository secrets.
- If the run is from a forked pull request, secrets may be unavailable by default.

### Tests pass but CI should fail when upload fails

- Keep `failOnUploadError: true` in `vitest.config.ts`.

### Upload works but Jira shows no data

- Verify your Testream project is connected to the correct Jira workspace.
- Confirm the Testream Automated Test Management and Reporting for Jira app is installed in that workspace.

## FAQ

### Is this a production-ready template or just a demo?

It is an example repository designed to be copied and adapted. The CI workflow and reporter config are real and production-oriented.

### Why are there failing tests in this repo?

They are intentional, so you can preview failure triage in Testream/Jira (diffs, stacks, and error context).

### Can I use this with other test frameworks?

Testream supports multiple frameworks, but this repository is specifically for Vitest.

### Can I run tests without Testream?

Yes. Without `TESTREAM_API_KEY`, tests run normally and skip upload.

## Vitest Jira reporting alternatives (quick view)

| Approach | Benefit | Tradeoff |
|---|---|---|
| Raw JUnit artifacts only | Simple storage | Limited Jira-native analytics |
| Custom API scripts | Flexible | Higher maintenance and reliability burden |
| Testream reporter (this repo) | Native Vitest integration + Jira insights | Requires Testream setup |

## Related links

- Testream app: <https://testream.app>
- Testream Automated Test Management and Reporting for Jira (Marketplace): <https://marketplace.atlassian.com/apps/3048460704/testream-automated-test-management-and-reporting-for-jira>
- Vitest reporter docs: <https://docs.testream.app/reporters/vitest>
- Vitest docs: <https://vitest.dev>
