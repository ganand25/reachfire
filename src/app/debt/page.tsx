import type { Metadata } from 'next';
import { DebtClient } from './DebtClient';

export const metadata: Metadata = {
  title: 'Debt Payoff Accelerator — ReachFire',
  description:
    'Avalanche vs snowball strategy comparison. See how killing debt redirects cash flow to investments.',
};

export default function DebtPage(): React.JSX.Element {
  return <DebtClient />;
}
