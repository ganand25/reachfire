import type { Metadata } from 'next';
import { Shield, Database, Calculator, TrendingUp, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About & Methodology — ReachFire',
  description: "How ReachFire's calculations work, our data sources, and our privacy commitment.",
};

export default function AboutPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <div className="mb-12">
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
          Built for the FIRE community
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          ReachFire is a free FIRE calculator with geoarbitrage, Roth ladder planning, and AI
          insights. Every calculation runs in your browser. We never see your data.
        </p>
      </div>

      {/* Privacy */}
      <section
        id="privacy"
        className="mb-12 p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5"
      >
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-emerald-400" />
          <h2 className="text-xl font-bold">Privacy Commitment</h2>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">All calculations run 100% in your browser</strong>{' '}
            using JavaScript. Your financial data never leaves your device. There is no account to
            create, no database storing your numbers, and no tracking of your inputs.
          </p>
          <p>
            The only exception is the optional AI Insights feature, which sends anonymized financial
            parameters (no personal identifiers) to Anthropic&apos;s Claude API for analysis. This
            requires explicit user action — clicking &quot;Get AI Analysis.&quot; No other feature
            sends any data to any server.
          </p>
          <p>
            ReachFire uses no advertising, no analytics pixels, and no third-party tracking scripts.
            We earn nothing from your data because we collect none of it.
          </p>
        </div>
      </section>

      {/* Methodology */}
      <section id="methodology" className="mb-12">
        <h2 className="text-2xl font-bold font-display mb-6">Methodology</h2>

        <div className="space-y-8">
          <div className="border-l-2 border-primary pl-5">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">FIRE Number</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The FIRE number is calculated as{' '}
              <code className="bg-secondary px-1 rounded">Annual Expenses ÷ Withdrawal Rate</code>.
              The default 4% withdrawal rate comes from the{' '}
              <strong className="text-foreground">Trinity Study (1998)</strong> by Cooley, Hubbard,
              and Walz, which found that a 4% withdrawal rate from a diversified portfolio
              historically sustained 30-year retirements with high probability. For longer
              retirements (40+ years), we recommend 3.5%.
            </p>
          </div>

          <div className="border-l-2 border-primary pl-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">Portfolio Projection</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Projections use the standard future value formula with monthly compounding:
              <code className="block bg-secondary px-2 py-1 rounded mt-2 mb-2 text-xs overflow-x-auto">
                FV = PV × (1 + r)ⁿ + PMT × ((1 + r)ⁿ - 1) / r
              </code>
              Where r is the monthly return rate (annual rate ÷ 12) and n is the number of months.
              Real (inflation-adjusted) returns use the Fisher equation:{' '}
              <code className="bg-secondary px-1 rounded">(1 + nominal) / (1 + inflation) - 1</code>
              .
            </p>
          </div>

          <div className="border-l-2 border-primary pl-5">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">Monte Carlo Simulation</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Monte Carlo simulations use a{' '}
              <strong className="text-foreground">log-normal return distribution</strong> based on
              historical S&P 500 statistics. The standard deviation defaults to ~17% annually,
              derived from the Shiller dataset. Each simulation generates random annual returns
              using the Box-Muller transform for normally distributed random variables, then
              exponentiates them for log-normal returns. We run 1,000 simulations by default.
              Success rate = percentage of simulations where the portfolio survives to the end of
              the projection period.
            </p>
          </div>

          <div className="border-l-2 border-primary pl-5">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">Historical Backtesting</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Historical backtesting uses actual annual returns from the{' '}
              <strong className="text-foreground">Shiller dataset (1926–2024)</strong>, which tracks
              S&P 500 total returns (price + dividends) and long-term US government bond returns.
              For each start year from 1926 to (current year - duration), we simulate the specified
              withdrawal strategy using actual historical returns. The success rate is the
              percentage of historical 30-year periods where the portfolio survived.
            </p>
          </div>

          <div className="border-l-2 border-primary pl-5">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">Healthcare Cost Projections</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ACA (Affordable Care Act) premium estimates are based on the 2025 benchmark silver
              plan premiums by age band and the premium tax credit formula from{' '}
              <strong className="text-foreground">
                KFF&apos;s Health Insurance Marketplace data
              </strong>
              . Subsidies follow the American Rescue Plan Act extension rules (capped at 8.5% of
              income for incomes above 400% FPL). Medicare cost estimates use 2025 Part B standard
              premiums ($174.70/month) with IRMAA surcharges from CMS data. Healthcare inflation is
              modeled at 5.5% annually (20-year historical average). These are estimates — actual
              costs vary significantly by state, plan, and health status.
            </p>
          </div>
        </div>
      </section>

      {/* Assumptions */}
      <section id="assumptions" className="mb-12">
        <h2 className="text-2xl font-bold font-display mb-4">Key Assumptions</h2>
        <div className="rounded-xl border border-border bg-card p-5">
          <ul className="space-y-3 text-sm text-muted-foreground">
            {[
              'Returns are inflation-adjusted in real-dollar mode using the Fisher equation',
              'Monthly contributions are assumed to be invested at the end of each month',
              'Social Security income is not included in projections by default',
              'Tax efficiency of investments is not modeled (use the tax tools for tax analysis)',
              'Coast FIRE calculations assume contributions stop completely at the coast age',
              'Roth conversion ladder assumes the 5-year seasoning rule applies to each separate conversion',
              'Geoarbitrage adjustments are linear based on cost index ratios — lifestyle adjustments may vary',
              'Medical tourism savings estimates include $2,500 estimated travel costs',
              'Default asset allocation for historical backtesting: 60% stocks / 40% bonds',
            ].map((assumption) => (
              <li key={assumption} className="flex gap-2">
                <span className="text-primary mt-0.5">·</span>
                <span>{assumption}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Sources */}
      <section id="sources" className="mb-12">
        <h2 className="text-2xl font-bold font-display mb-4">Data Sources</h2>
        <div className="space-y-3 text-sm">
          {[
            {
              name: 'Shiller Dataset (1926–2024)',
              description:
                'Historical S&P 500 total returns and bond returns. Used for backtesting and Monte Carlo calibration.',
            },
            {
              name: 'Trinity Study (Cooley, Hubbard & Walz, 1998)',
              description: 'Foundation for the 4% safe withdrawal rate rule.',
            },
            {
              name: 'IRS Revenue Procedure 2024-40',
              description: '2025 federal income tax brackets and standard deductions.',
            },
            {
              name: 'CMS (Centers for Medicare & Medicaid Services)',
              description: 'Medicare Part B/D premium data and IRMAA surcharges for 2025.',
            },
            {
              name: 'KFF Health Insurance Marketplace',
              description: 'ACA benchmark premium data by age and state.',
            },
            {
              name: 'Numbeo / EIU / Mercer Cost of Living',
              description: 'Cost of living indices for 50+ cities worldwide.',
            },
            {
              name: 'Medical Tourism Association',
              description: 'Procedure cost benchmarks across destination countries.',
            },
          ].map((source) => (
            <div key={source.name} className="p-4 rounded-lg border border-border bg-card">
              <div className="font-medium text-foreground mb-1">{source.name}</div>
              <div className="text-muted-foreground text-xs">{source.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <div className="rounded-xl border-2 border-destructive/30 bg-destructive/5 p-6 text-sm">
        <p className="font-semibold text-foreground mb-3 text-base">Important Disclaimer</p>
        <div className="space-y-3 text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">
              ReachFire is not a financial adviser, investment adviser, broker-dealer, tax adviser,
              or legal professional
            </strong>{' '}
            of any kind. Nothing on this platform constitutes financial, investment, tax,
            accounting, or legal advice.
          </p>
          <p>
            All projections, simulations, and estimates are{' '}
            <strong className="text-foreground">
              hypothetical and for illustrative purposes only
            </strong>
            . They are based on mathematical models and historical data that may not reflect current
            conditions or your individual circumstances. Past market performance does not guarantee
            future results.
          </p>
          <p>
            Tax calculations use simplified models based on 2025 IRS data. Social Security estimates
            use the SSA bend-point formula but do not use your actual earnings record. Healthcare
            cost estimates are approximations — actual premiums vary by state, plan, and health
            status. Always verify with official sources (IRS.gov, SSA.gov, HealthCare.gov, CMS.gov).
          </p>
          <p>
            <strong className="text-foreground">
              Before making any financial, retirement, tax, or investment decisions, consult a
              qualified professional
            </strong>{' '}
            — such as a Certified Financial Planner (CFP), Registered Investment Adviser (RIA),
            Certified Public Accountant (CPA), or attorney — who can evaluate your specific
            circumstances.
          </p>
          <p className="text-xs pt-2 border-t border-border/50">
            Use of ReachFire is subject to our{' '}
            <a href="/terms" className="underline hover:text-foreground">
              Terms of Service
            </a>
            , which include a full disclaimer of warranties and limitation of liability. See also
            our{' '}
            <a href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
