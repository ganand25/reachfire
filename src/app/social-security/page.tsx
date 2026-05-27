import type { Metadata } from 'next';
import { SocialSecurityClient } from './SocialSecurityClient';

export const metadata: Metadata = {
  title: 'Social Security Optimizer — ReachFire',
  description:
    'Find your optimal Social Security claiming age. Compare breakeven points, spousal benefits, and see how SS reduces your required FIRE portfolio.',
};

export default function SocialSecurityPage(): React.JSX.Element {
  return <SocialSecurityClient />;
}
