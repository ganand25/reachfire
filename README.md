# ReachFire

**Free FIRE calculator with geoarbitrage, Roth ladder planning, and AI insights**

A comprehensive, privacy-first financial independence calculator that runs entirely in your browser. Calculate your path to FIRE with Monte Carlo simulations, explore geoarbitrage opportunities, plan Roth conversions, and get AI-powered insights—all without sending your data anywhere.

**Website:** [reachfire.app](https://reachfire.app)

## Features

- **FIRE Calculator** — Monte Carlo simulations, live projections, AI-powered insights
- **Scenario Comparison** — Compare Lean, Regular, Fat, Coast, and Barista FIRE side by side
- **Geoarbitrage Explorer** — See how relocating to 50+ cities worldwide shrinks your FIRE number
- **Roth Ladder Planner** — Visual 5-year seasoning timeline, tax bracket optimizer
- **Healthcare Cost Estimator** — ACA premiums, Medicare, HSA optimization, medical tourism
- **Withdrawal Simulator** — Test 4% rule and guardrails against 100 years of historical data
- **Coast FIRE** — Find when you can stop saving and coast to retirement
- **One Decision Impact** — See compound effects of lifestyle changes over 30 years
- **Social Security Optimizer** — Find optimal claiming age, compare breakeven points
- **Real Estate Analyzer** — Cap rate, cash-on-cash return, rental income impact
- **Debt Payoff Accelerator** — Avalanche vs snowball strategy comparison
- **Savings Rate Impact** — Interactive chart showing savings rate vs years to FIRE
- **Investment Growth Visualizer** — Watch compound interest in action

## Tech Stack

- **Frontend:** Next.js 15 + React 19 + TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **Testing:** Vitest v4 (unit) + Playwright (E2E)
- **API:** Anthropic Claude API (optional AI Insights feature)
- **Hosting:** Vercel

## Privacy

ReachFire respects your privacy completely:

- ✅ **100% client-side** — All calculations run in your browser. No data is ever sent to our servers.
- ✅ **No accounts** — No logins, no email collection, no user database.
- ✅ **No tracking** — No analytics, no ads, no cookies, no third-party trackers.
- ✅ **Optional AI** — The "Get AI Analysis" feature is opt-in and sends only anonymized parameters to Anthropic's Claude API.
- ✅ **Open source** — Your financial data never leaves your device.

See our [Privacy Policy](https://reachfire.app/privacy) for full details.

## Getting Started

### Prerequisites
- Node.js 20+ / npm or pnpm
- Git

### Installation

```bash
git clone <repo-url>
cd fire-calculator
npm install
```

### Development

```bash
npm run dev
```

Opens [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

### Testing

```bash
npm test           # Unit tests (Vitest)
npm run test:e2e   # E2E tests (Playwright)
npm run lint       # ESLint
npm run format     # Prettier
```

## Project Structure

```
src/
  app/              # Next.js App Router pages
  components/       # Reusable React components
  lib/              # Utilities, Supabase client, constants
  hooks/            # Custom React hooks
  types/            # TypeScript type definitions
  services/         # Business logic & API integrations
  test/             # Test setup and utilities
  e2e/              # Playwright E2E tests
```

## Key Assumptions & Methodology

### FIRE Number
The FIRE number = Annual Expenses ÷ Withdrawal Rate

Default 4% withdrawal rate from the **Trinity Study (1998)** by Cooley, Hubbard, and Walz.

### Monte Carlo Simulations
- Log-normal return distribution based on historical S&P 500
- ~17% annual standard deviation (Shiller dataset)
- 1,000 simulations per run
- Success rate = % of simulations where portfolio survives to end of projection

### Historical Backtesting
Uses actual returns from the **Shiller dataset (1926–2024)** including:
- S&P 500 total returns (price + dividends)
- Long-term US government bond returns
- Tests against all historical periods of chosen duration

### Healthcare Costs
- **ACA (pre-65)** — 2025 benchmark premiums by age + premium tax credit
- **Medicare (65+)** — Part B standard premiums + IRMAA surcharges
- Healthcare inflation: 5.5% annually

### Tax Calculations
- 2025 federal income tax brackets and standard deductions
- Social Security bend-point formula (not individual earnings record)
- Simplified models — always verify with official sources

See [About & Methodology](https://reachfire.app/about) for complete technical details.

## Important Disclaimers

ReachFire is **not** a financial adviser, investment adviser, tax adviser, or legal professional. Nothing on this platform constitutes financial or legal advice.

All projections are **hypothetical and for illustrative purposes only** based on simplified models and historical data. They may not reflect current conditions or your individual circumstances. Past performance does not guarantee future results.

**Before making any financial, retirement, tax, or investment decisions, consult a qualified professional** (CFP, RIA, CPA, or attorney).

See our full [Terms of Service](https://reachfire.app/terms).

## Development Guidelines

### Code Style
- Strict TypeScript — no `any` types
- Functional components only
- Server components by default (`'use client'` only when needed)
- Named exports (except pages)
- Tailwind CSS for styling
- Test behavior, not implementation

### Commit Convention
```
<type>(<scope>): <description>

Types: feat, fix, refactor, docs, test, chore, style, perf
Example: feat(calculator): add cost of living adjustment
```

### Before Committing
```bash
npm run typecheck && npm run lint && npm test
```

## Contributing

Contributions welcome! Please follow our coding conventions and ensure all tests pass before submitting a PR.

## Data Sources

- **Shiller Dataset** — Historical S&P 500 returns (1926–2024)
- **Trinity Study** — 4% safe withdrawal rate research
- **IRS** — Tax brackets, standard deductions (2025)
- **CMS** — Medicare premium data
- **KFF** — ACA marketplace data
- **Numbeo / EIU / Mercer** — Cost of living indices (50+ cities)
- **Medical Tourism Association** — Procedure cost benchmarks

## License

See LICENSE file for details.

## Questions?

Visit [reachfire.app/about](https://reachfire.app/about) or review our [Privacy Policy](https://reachfire.app/privacy) and [Terms of Service](https://reachfire.app/terms).
