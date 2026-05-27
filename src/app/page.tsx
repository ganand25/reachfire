import Link from 'next/link';
import {
  Flame,
  Shield,
  TrendingUp,
  Globe,
  Brain,
  BarChart3,
  Heart,
  Coins,
  ArrowRight,
  Zap,
  Building2,
  DollarSign,
  PiggyBank,
  Users,
} from 'lucide-react';
import { LandingTeaser } from './LandingTeaser';
import { FadeUp, StaggerContainer, StaggerItem } from '@/components/Animated';

const TOOLS = [
  {
    href: '/calculator',
    icon: BarChart3,
    title: 'FIRE Calculator',
    description: 'Monte Carlo simulations, live projections, and AI-powered insights.',
    badge: 'Core Tool',
  },
  {
    href: '/retirement',
    icon: PiggyBank,
    title: 'Retirement Tax Optimizer',
    description: 'Compare withdrawal strategies to minimize lifetime taxes across all accounts.',
    badge: 'New',
  },
  {
    href: '/family-tax',
    icon: Users,
    title: 'Total Family Tax',
    description:
      'The only calculator that includes what your kids will pay. SECURE Act heir tax + ACA subsidies.',
    badge: 'Unique',
  },
  {
    href: '/scenarios',
    icon: TrendingUp,
    title: 'Scenario Comparison',
    description: 'Compare Lean, Regular, Fat, Coast, and Barista FIRE side by side.',
    badge: null,
  },
  {
    href: '/geoarbitrage',
    icon: Globe,
    title: 'Geoarbitrage',
    description: 'See how relocating to 50+ cities worldwide shrinks your FIRE number.',
    badge: 'Unique',
  },
  {
    href: '/roth-ladder',
    icon: Coins,
    title: 'Roth Ladder',
    description: 'Visual 5-year seasoning timeline, tax bracket optimizer.',
    badge: null,
  },
  {
    href: '/healthcare',
    icon: Heart,
    title: 'Healthcare Costs',
    description: 'ACA premiums, Medicare, HSA optimization, and medical tourism savings.',
    badge: 'Unique',
  },
  {
    href: '/withdrawal',
    icon: TrendingUp,
    title: 'Withdrawal Simulator',
    description: 'Test 4% rule and guardrails against 100 years of historical data.',
    badge: null,
  },
  {
    href: '/coast',
    icon: Zap,
    title: 'Coast FIRE',
    description: 'Find the exact age when you can stop saving and coast to retirement.',
    badge: null,
  },
  {
    href: '/one-decision',
    icon: Brain,
    title: 'One Decision Impact',
    description: 'See the compound effect of a single lifestyle change over 30 years.',
    badge: null,
  },
  {
    href: '/social-security',
    icon: DollarSign,
    title: 'Social Security',
    description: 'Optimize your claiming age. Breakeven analysis, spousal benefits.',
    badge: null,
  },
  {
    href: '/real-estate',
    icon: Building2,
    title: 'Real Estate',
    description: "Cap rate, cash-on-cash return, and rental income's impact on FIRE.",
    badge: null,
  },
  {
    href: '/debt',
    icon: ArrowRight,
    title: 'Debt Payoff',
    description: 'Avalanche vs snowball comparison. See how debt freedom accelerates FIRE.',
    badge: null,
  },
  {
    href: '/savings-rate',
    icon: BarChart3,
    title: 'Savings Rate',
    description: 'The single most powerful lever. See your exact FIRE timeline curve.',
    badge: null,
  },
];

export default function HomePage(): React.JSX.Element {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(ellipse, oklch(0.78 0.14 80) 0%, transparent 70%)',
            }}
          />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-16 sm:pt-20 pb-16 text-center">
          {/* Badge */}
          <FadeUp delay={0}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs text-muted-foreground mb-6 sm:mb-8">
              <Shield className="w-3 h-3 text-emerald-500" />
              <span>100% free · No account · Your data stays in your browser</span>
            </div>
          </FadeUp>

          {/* Headline */}
          <FadeUp delay={0.08}>
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-5 sm:mb-6">
              Your path to <span className="gradient-ember-text">financial</span>
              <br className="hidden sm:block" />{' '}
              <span className="gradient-ember-text">freedom</span> starts here.
            </h1>
          </FadeUp>

          <FadeUp delay={0.16}>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10">
              Answer a few questions and we&apos;ll show you exactly where you stand — and how to
              get to financial independence faster. No account needed. Your data never leaves your
              browser.
            </p>
          </FadeUp>

          <FadeUp delay={0.22}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16">
              <Link
                href="/plan"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-ember text-white font-semibold shadow-lg hover:opacity-90 transition-opacity glow-ember-sm"
              >
                <Flame className="w-5 h-5" />
                Find Your Path — It&apos;s Free
              </Link>
              <Link
                href="/about"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                How it works
              </Link>
            </div>
          </FadeUp>

          {/* Interactive teaser */}
          <FadeUp delay={0.28}>
            <LandingTeaser />
          </FadeUp>

          {/* Goal quick-links */}
          <FadeUp delay={0.36}>
            <div className="mt-10 sm:mt-12">
              <p className="text-center text-xs text-muted-foreground mb-4 font-medium uppercase tracking-wider">
                Or jump straight to what you need
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 max-w-3xl mx-auto">
                {[
                  { href: '/plan?goal=when-retire', label: 'When can I retire?', emoji: '📅' },
                  { href: '/plan?goal=reduce-taxes', label: 'Reduce my taxes', emoji: '🧾' },
                  { href: '/plan?goal=on-track', label: 'Am I on track?', emoji: '🎯' },
                  { href: '/plan?goal=where-retire', label: 'Where to retire?', emoji: '🌍' },
                  { href: '/plan?goal=withdraw-money', label: 'How to withdraw?', emoji: '💰' },
                ].map((goal) => (
                  <Link
                    key={goal.href}
                    href={goal.href}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-border bg-card/50 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-card transition-all"
                  >
                    <span>{goal.emoji}</span>
                    <span>{goal.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Differentiators */}
      <section className="border-y border-border/50 bg-card/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
          <FadeUp>
            <p className="text-center text-sm text-muted-foreground mb-8 font-medium uppercase tracking-wider">
              What ReachFire has that no one else does
            </p>
          </FadeUp>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: Globe,
                title: 'Geoarbitrage Explorer',
                description:
                  'Compare 50+ cities worldwide. "Your $1.2M SF FIRE number becomes $480K in Lisbon."',
              },
              {
                icon: Heart,
                title: 'Medical Tourism Savings',
                description:
                  'Hip replacement: $40K US vs $7K India. See your 30-year healthcare savings.',
              },
              {
                icon: Brain,
                title: 'AI FIRE Advisor',
                description:
                  'Personalized insights: "Cutting $200/mo moves your FIRE date 14 months closer."',
              },
            ].map((item) => (
              <StaggerItem key={item.title} className="flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-xl gradient-ember flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Tools grid */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        <FadeUp>
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">
              Every tool you need
            </h2>
            <p className="text-muted-foreground">
              A complete suite for every stage of your FIRE journey.
            </p>
          </div>
        </FadeUp>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TOOLS.map((tool) => (
            <StaggerItem key={tool.href}>
              <Link
                href={tool.href}
                className="group relative flex flex-col h-full rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-sm transition-all duration-200"
              >
                {tool.badge && (
                  <span className="absolute top-3 right-3 text-xs px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/20">
                    {tool.badge}
                  </span>
                )}
                <div className="w-9 h-9 rounded-lg gradient-ember flex items-center justify-center mb-3 shrink-0">
                  <tool.icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-sm mb-1.5 group-hover:text-primary transition-colors">
                  {tool.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                  {tool.description}
                </p>
                <div className="flex items-center gap-1 mt-3 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Open tool</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Social proof */}
      <section className="border-t border-border/50 bg-card/20">
        <FadeUp>
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14 text-center">
            <p className="font-display text-2xl sm:text-3xl font-bold mb-2">
              Join thousands planning their escape
            </p>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">
              Free forever. No account required. Your data never leaves your browser. Built by the
              FIRE community, for the FIRE community.
            </p>
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-ember text-white font-medium hover:opacity-90 transition-opacity"
            >
              Start Your Plan
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeUp>
      </section>
    </div>
  );
}
