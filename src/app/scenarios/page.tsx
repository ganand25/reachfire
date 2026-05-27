import type { Metadata } from 'next';
import { ScenariosClient } from './ScenariosClient';

export const metadata: Metadata = {
  title: 'FIRE Scenario Comparison — ReachFire',
  description:
    'Compare Lean FIRE, Regular FIRE, Fat FIRE, Coast FIRE, and Barista FIRE side by side with your numbers.',
};

export default function ScenariosPage(): React.JSX.Element {
  return <ScenariosClient />;
}
