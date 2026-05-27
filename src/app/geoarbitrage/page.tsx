import type { Metadata } from 'next';
import { GeoarbitrageClient } from './GeoarbitrageClient';

export const metadata: Metadata = {
  title: 'Geoarbitrage Explorer — ReachFire',
  description:
    'See how relocating to 50+ cities worldwide changes your FIRE number. Compare cost of living across the globe.',
};

export default function GeoarbitragePage(): React.JSX.Element {
  return <GeoarbitrageClient />;
}
