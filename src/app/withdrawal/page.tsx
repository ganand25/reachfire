import type { Metadata } from 'next';
import { WithdrawalClient } from './WithdrawalClient';

export const metadata: Metadata = {
  title: 'Withdrawal Strategy Simulator — ReachFire',
  description: 'Test 4% rule, guardrails, and VPW against 100 years of historical market data.',
};

export default function WithdrawalPage(): React.JSX.Element {
  return <WithdrawalClient />;
}
