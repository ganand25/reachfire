import {
  Calendar,
  Receipt,
  Target,
  Globe,
  ArrowDownToLine,
  BarChart3,
  Coins,
  Zap,
  Heart,
  TrendingUp,
  PiggyBank,
  Users,
  Brain,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';

export interface WizardGoal {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  targetRoute: string;
  color: string;
}

export const WIZARD_GOALS: WizardGoal[] = [
  {
    id: 'when-retire',
    icon: Calendar,
    title: 'When can I retire?',
    subtitle: "Calculate your FIRE number and see how many years until you're free",
    targetRoute: '/calculator',
    color: 'bg-primary/15',
  },
  {
    id: 'reduce-taxes',
    icon: Receipt,
    title: 'How do I pay less tax in retirement?',
    subtitle: 'Find the withdrawal order that minimizes your lifetime taxes',
    targetRoute: '/retirement',
    color: 'bg-emerald-500/15',
  },
  {
    id: 'on-track',
    icon: Target,
    title: 'Am I on track to retire?',
    subtitle: 'See if your current savings rate gets you to financial independence',
    targetRoute: '/savings-rate',
    color: 'bg-blue-500/15',
  },
  {
    id: 'where-retire',
    icon: Globe,
    title: 'Where should I retire?',
    subtitle: 'Compare costs across 50+ cities and see how location changes your number',
    targetRoute: '/geoarbitrage',
    color: 'bg-purple-500/15',
  },
  {
    id: 'withdraw-money',
    icon: ArrowDownToLine,
    title: 'How should I draw down my savings?',
    subtitle: 'Test withdrawal rates against 100 years of market history',
    targetRoute: '/withdrawal',
    color: 'bg-amber-500/15',
  },
];

export interface NextStepConfig {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export const NEXT_STEPS: Record<string, NextStepConfig[]> = {
  '/calculator': [
    {
      href: '/savings-rate',
      icon: BarChart3,
      title: 'Optimize your savings rate',
      description: 'See how even small changes to your savings rate shift your timeline',
    },
    {
      href: '/coast',
      icon: Zap,
      title: 'Find your Coast FIRE age',
      description: 'When can you stop saving and let growth do the rest?',
    },
    {
      href: '/retirement',
      icon: PiggyBank,
      title: 'Plan tax-efficient withdrawals',
      description: 'The right withdrawal order can save six figures in taxes',
    },
  ],
  '/retirement': [
    {
      href: '/family-tax',
      icon: Users,
      title: 'Include what your heirs pay',
      description: 'SECURE Act forces heirs to drain inherited IRAs — see the true cost',
    },
    {
      href: '/roth-ladder',
      icon: Coins,
      title: 'Plan your Roth ladder',
      description: 'Visualize the 5-year seasoning timeline for tax-free access',
    },
    {
      href: '/withdrawal',
      icon: TrendingUp,
      title: 'Test withdrawal strategies',
      description: 'Stress-test your plan against 100 years of market data',
    },
  ],
  '/family-tax': [
    {
      href: '/retirement',
      icon: PiggyBank,
      title: 'Optimize your own taxes',
      description: 'Focus on your personal lifetime tax before adding heir impact',
    },
    {
      href: '/roth-ladder',
      icon: Coins,
      title: 'Plan Roth conversions',
      description: 'See the year-by-year conversion schedule and tax brackets',
    },
    {
      href: '/calculator',
      icon: BarChart3,
      title: 'Run a full FIRE projection',
      description: 'Monte Carlo simulation with multiple scenarios',
    },
  ],
  '/withdrawal': [
    {
      href: '/retirement',
      icon: PiggyBank,
      title: 'Compare tax strategies',
      description: 'See which withdrawal order minimizes lifetime taxes',
    },
    {
      href: '/roth-ladder',
      icon: Coins,
      title: 'Build a Roth ladder',
      description: 'Convert Traditional to Roth at low brackets before RMDs hit',
    },
    {
      href: '/calculator',
      icon: BarChart3,
      title: 'Full FIRE projection',
      description: 'Monte Carlo simulation of your retirement plan',
    },
  ],
  '/coast': [
    {
      href: '/calculator',
      icon: BarChart3,
      title: 'Run a full projection',
      description: 'See the complete picture with Monte Carlo simulations',
    },
    {
      href: '/savings-rate',
      icon: Target,
      title: 'Check your savings rate',
      description: 'The single most powerful lever in early retirement math',
    },
    {
      href: '/one-decision',
      icon: Brain,
      title: "See one decision's impact",
      description: 'How a single lifestyle change compounds over 30 years',
    },
  ],
  '/savings-rate': [
    {
      href: '/calculator',
      icon: BarChart3,
      title: 'Full FIRE projection',
      description: 'Turn your savings rate into a detailed retirement timeline',
    },
    {
      href: '/coast',
      icon: Zap,
      title: 'Find your Coast FIRE age',
      description: 'When your investments grow to your target on their own',
    },
    {
      href: '/one-decision',
      icon: Brain,
      title: 'Impact of one change',
      description: 'See how cutting one expense compounds over 30 years',
    },
  ],
  '/geoarbitrage': [
    {
      href: '/healthcare',
      icon: Heart,
      title: 'Compare healthcare costs',
      description: 'ACA premiums, Medicare, and medical tourism savings',
    },
    {
      href: '/calculator',
      icon: BarChart3,
      title: 'Recalculate your FIRE number',
      description: 'Plug in your new expenses from a different city',
    },
    {
      href: '/retirement',
      icon: PiggyBank,
      title: 'Plan tax-efficient withdrawals',
      description: 'Lower expenses might change your optimal strategy',
    },
  ],
  '/roth-ladder': [
    {
      href: '/retirement',
      icon: PiggyBank,
      title: 'Full tax strategy comparison',
      description: 'See all four withdrawal strategies side by side',
    },
    {
      href: '/family-tax',
      icon: Users,
      title: 'Include heir tax impact',
      description: 'Roth conversions mean tax-free money for your heirs',
    },
    {
      href: '/withdrawal',
      icon: TrendingUp,
      title: 'Test withdrawal rates',
      description: 'Make sure your drawdown rate survives bad markets',
    },
  ],
  '/healthcare': [
    {
      href: '/geoarbitrage',
      icon: Globe,
      title: 'Compare cities worldwide',
      description: 'Healthcare costs vary wildly — see where to save',
    },
    {
      href: '/retirement',
      icon: PiggyBank,
      title: 'Factor healthcare into your plan',
      description: 'ACA subsidies depend on your withdrawal strategy',
    },
    {
      href: '/calculator',
      icon: BarChart3,
      title: 'Full FIRE projection',
      description: 'Include healthcare in your expense estimates',
    },
  ],
  '/social-security': [
    {
      href: '/retirement',
      icon: PiggyBank,
      title: 'Optimize withdrawal strategy',
      description: 'SS claiming age affects your tax bracket — see the tradeoff',
    },
    {
      href: '/calculator',
      icon: BarChart3,
      title: 'Full FIRE projection',
      description: 'Factor Social Security into your retirement timeline',
    },
    {
      href: '/withdrawal',
      icon: TrendingUp,
      title: 'Test with different SS amounts',
      description: 'See how claiming age affects portfolio survival',
    },
  ],
  '/real-estate': [
    {
      href: '/calculator',
      icon: BarChart3,
      title: 'Add rental income to FIRE plan',
      description: 'See how real estate accelerates your timeline',
    },
    {
      href: '/debt',
      icon: ArrowRight,
      title: 'Evaluate mortgage payoff',
      description: 'Should you pay off the mortgage or invest?',
    },
    {
      href: '/savings-rate',
      icon: Target,
      title: 'Check your overall savings rate',
      description: 'Include property cash flow in your savings picture',
    },
  ],
  '/debt': [
    {
      href: '/savings-rate',
      icon: Target,
      title: 'See your savings rate without debt',
      description: 'Debt freedom supercharges your savings rate',
    },
    {
      href: '/calculator',
      icon: BarChart3,
      title: 'Project your FIRE timeline',
      description: 'Factor in when your debt disappears',
    },
    {
      href: '/one-decision',
      icon: Brain,
      title: 'Impact of extra payments',
      description: 'See the 30-year compound effect of paying debt faster',
    },
  ],
  '/growth': [
    {
      href: '/calculator',
      icon: BarChart3,
      title: 'Full FIRE projection',
      description: 'Turn your growth assumptions into a retirement plan',
    },
    {
      href: '/coast',
      icon: Zap,
      title: 'Find your Coast FIRE age',
      description: 'When your investments coast to your target on their own',
    },
    {
      href: '/savings-rate',
      icon: Target,
      title: 'Optimize your savings rate',
      description: 'Growth rate matters, but savings rate matters more',
    },
  ],
  '/one-decision': [
    {
      href: '/savings-rate',
      icon: Target,
      title: 'Check your savings rate',
      description: 'One decision might shift your savings rate dramatically',
    },
    {
      href: '/calculator',
      icon: BarChart3,
      title: 'Full FIRE projection',
      description: 'See how this decision changes your retirement date',
    },
    {
      href: '/coast',
      icon: Zap,
      title: 'Find your Coast FIRE age',
      description: 'Could this one change let you coast earlier?',
    },
  ],
  '/scenarios': [
    {
      href: '/calculator',
      icon: BarChart3,
      title: 'Deep dive on one scenario',
      description: 'Pick your favorite scenario and run a full projection',
    },
    {
      href: '/geoarbitrage',
      icon: Globe,
      title: 'Explore location-based savings',
      description: 'Moving can shift your scenario dramatically',
    },
    {
      href: '/retirement',
      icon: PiggyBank,
      title: 'Plan tax-efficient withdrawals',
      description: 'Different scenarios need different tax strategies',
    },
  ],
};

export function buildWizardParams(
  targetRoute: string,
  profile: { age: number; annualIncome: number; currentSavings: number; annualExpenses: number }
): string {
  const params = new URLSearchParams();

  switch (targetRoute) {
    case '/calculator':
      params.set('age', String(profile.age));
      params.set('income', String(profile.annualIncome));
      params.set('expenses', String(profile.annualExpenses));
      params.set('portfolio', String(profile.currentSavings));
      break;
    case '/retirement':
      params.set('currentAge', String(profile.age));
      params.set('annualExpenses', String(profile.annualExpenses));
      params.set('traditionalBalance', String(Math.round(profile.currentSavings * 0.6)));
      params.set('rothBalance', String(Math.round(profile.currentSavings * 0.2)));
      params.set('taxableBalance', String(Math.round(profile.currentSavings * 0.2)));
      break;
    case '/savings-rate':
      params.set('annualIncome', String(profile.annualIncome));
      params.set(
        'savingsRate',
        String(
          Math.round(((profile.annualIncome - profile.annualExpenses) / profile.annualIncome) * 100)
        )
      );
      break;
    case '/geoarbitrage':
      params.set('annualExpenses', String(profile.annualExpenses));
      params.set('currentPortfolio', String(profile.currentSavings));
      break;
    case '/withdrawal':
      params.set('portfolio', String(profile.currentSavings));
      params.set('annualSpending', String(profile.annualExpenses));
      break;
  }

  const paramStr = params.toString();
  return paramStr ? `${targetRoute}?${paramStr}` : targetRoute;
}
