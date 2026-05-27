import type { Metadata } from 'next';
import { SavingsRateClient } from './SavingsRateClient';

export const metadata: Metadata = {
  title: 'Savings Rate Impact — ReachFire',
  description: 'The famous savings rate vs years to FIRE chart — interactive and personalized.',
};

export default function SavingsRatePage(): React.JSX.Element {
  return <SavingsRateClient />;
}
