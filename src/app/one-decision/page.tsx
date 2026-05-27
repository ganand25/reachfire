import type { Metadata } from 'next';
import { OneDecisionClient } from './OneDecisionClient';

export const metadata: Metadata = {
  title: 'One Decision Impact — ReachFire',
  description: 'See the compound effect of a single lifestyle change on your FIRE timeline.',
};

export default function OneDecisionPage(): React.JSX.Element {
  return <OneDecisionClient />;
}
