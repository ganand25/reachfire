'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { PageEnter } from '@/components/Animated';
import { SliderInput } from '@/components/SliderInput';
import { CurrencyInput } from '@/components/CurrencyInput';
import { cn } from '@/lib/utils';
import { WIZARD_GOALS, buildWizardParams } from '@/lib/wizard-config';
import type { WizardGoal } from '@/lib/wizard-config';

const STEP_TITLES = ['Choose your goal', 'Quick profile'] as const;

const slideVariants = {
  enter: (direction: number): { opacity: number; x: number } => ({
    opacity: 0,
    x: direction > 0 ? 60 : -60,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number): { opacity: number; x: number } => ({
    opacity: 0,
    x: direction > 0 ? -60 : 60,
  }),
};

const slideTransition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

function StepIndicator({ currentStep }: { currentStep: number }): React.JSX.Element {
  return (
    <div className="flex items-center justify-center gap-6 mb-10">
      {STEP_TITLES.map((title, index) => (
        <div key={title} className="flex items-center gap-2">
          <div
            className={cn(
              'w-2 h-2 rounded-full transition-colors duration-300',
              index === currentStep ? 'bg-primary' : 'bg-muted-foreground/30'
            )}
          />
          <span
            className={cn(
              'text-sm transition-colors duration-300',
              index === currentStep ? 'text-foreground font-medium' : 'text-muted-foreground'
            )}
          >
            {title}
          </span>
        </div>
      ))}
    </div>
  );
}

function GoalCard({
  goal,
  selected,
  onClick,
}: {
  goal: WizardGoal;
  selected: boolean;
  onClick: () => void;
}): React.JSX.Element {
  const Icon = goal.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-2xl border-2 border-border bg-card p-6 cursor-pointer',
        'hover:border-primary/50 hover:shadow-md transition-all text-left w-full',
        selected && 'border-primary bg-primary/5 ring-2 ring-primary/20'
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'flex items-center justify-center w-12 h-12 rounded-xl shrink-0',
            goal.color
          )}
        >
          <Icon className="w-6 h-6 text-foreground" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground">{goal.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{goal.subtitle}</p>
        </div>
      </div>
    </button>
  );
}

export function PlanWizardClient(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialGoalId = searchParams.get('goal');
  const initialGoal = initialGoalId
    ? (WIZARD_GOALS.find((g) => g.id === initialGoalId) ?? null)
    : null;

  const [step, setStep] = useState(initialGoal ? 1 : 0);
  const [direction, setDirection] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState<WizardGoal | null>(initialGoal);

  const [age, setAge] = useState(35);
  const [annualIncome, setAnnualIncome] = useState(100_000);
  const [currentSavings, setCurrentSavings] = useState(200_000);
  const [annualExpenses, setAnnualExpenses] = useState(50_000);

  const handleGoalSelect = useCallback((goal: WizardGoal) => {
    setSelectedGoal(goal);
    setDirection(1);
    setStep(1);
  }, []);

  const handleBack = useCallback(() => {
    setDirection(-1);
    setStep(0);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!selectedGoal) return;

    const url = buildWizardParams(selectedGoal.targetRoute, {
      age,
      annualIncome,
      currentSavings,
      annualExpenses,
    });

    router.push(url);
  }, [selectedGoal, age, annualIncome, currentSavings, annualExpenses, router]);

  const isSubmitDisabled = useMemo(
    () => !selectedGoal || annualIncome <= 0,
    [selectedGoal, annualIncome]
  );

  return (
    <PageEnter>
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        <StepIndicator currentStep={step} />

        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 && (
            <motion.div
              key="step-goals"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  What brings you here?
                </h1>
                <p className="text-muted-foreground">
                  Pick a goal and we&apos;ll point you to the right tool.
                </p>
              </div>

              <div className="grid gap-4">
                {WIZARD_GOALS.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    selected={selectedGoal?.id === goal.id}
                    onClick={() => handleGoalSelect(goal)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-profile"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
            >
              <div className="mb-8">
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 transition-colors mb-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <div className="text-center">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                    Tell us a little about you
                  </h1>
                  <p className="text-muted-foreground">
                    We&apos;ll pre-fill your calculator with these numbers. You can always adjust
                    later.
                  </p>
                </div>
              </div>

              <div className="space-y-6 max-w-md mx-auto">
                <SliderInput
                  label="Current Age"
                  value={age}
                  min={20}
                  max={70}
                  step={1}
                  onChange={setAge}
                  format="number"
                  minLabel="20"
                  maxLabel="70"
                />

                <CurrencyInput
                  label="Annual Income"
                  value={annualIncome}
                  onChange={setAnnualIncome}
                  hint="Gross income before taxes"
                />

                <CurrencyInput
                  label="Total Savings"
                  value={currentSavings}
                  onChange={setCurrentSavings}
                  hint="All invested assets (401k, IRA, brokerage, etc.)"
                />

                <CurrencyInput
                  label="Annual Expenses"
                  value={annualExpenses}
                  onChange={setAnnualExpenses}
                  hint="What you spend per year, including housing"
                />

                <div className="pt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled}
                    className={cn(
                      'gradient-ember text-white font-semibold px-8 py-3 rounded-xl glow-ember-sm',
                      'flex items-center gap-2 transition-opacity',
                      isSubmitDisabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    Show My Results
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageEnter>
  );
}
