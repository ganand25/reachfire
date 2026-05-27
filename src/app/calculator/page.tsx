import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CalculatorClient } from './CalculatorClient';

export const metadata: Metadata = {
  title: 'FIRE Calculator — ReachFire',
  description:
    'Calculate your FIRE number, years to retirement, and Monte Carlo projections with real historical data.',
};

export default function CalculatorPage(): React.JSX.Element {
  return (
    <Suspense>
      <CalculatorClient />
    </Suspense>
  );
}
