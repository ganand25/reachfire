'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NEXT_STEPS } from '@/lib/wizard-config';
import { StaggerContainer, StaggerItem } from '@/components/Animated';

interface NextStepsProps {
  currentPath: string;
}

export function NextSteps({ currentPath }: NextStepsProps): React.JSX.Element | null {
  const steps = NEXT_STEPS[currentPath];

  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="mb-4 text-lg font-semibold text-foreground">What to explore next</h2>

      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {steps.map((step) => (
          <StaggerItem key={step.href}>
            <Link
              href={step.href}
              className={cn(
                'flex items-start gap-3 rounded-xl border border-border bg-card p-4',
                'hover:border-primary/40 transition-colors group'
              )}
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <step.icon className="h-4 w-4" />
              </span>

              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {step.title}
                </span>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                  {step.description}
                </p>
              </div>

              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}
