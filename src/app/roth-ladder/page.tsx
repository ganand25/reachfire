import type { Metadata } from 'next';
import { RothLadderClient } from './RothLadderClient';

export const metadata: Metadata = {
  title: 'Roth Conversion Ladder Planner — ReachFire',
  description:
    'Visual 5-year seasoning timeline, tax bracket optimizer, and bridge fund calculator for early retirees.',
};

export default function RothLadderPage(): React.JSX.Element {
  return <RothLadderClient />;
}
