import type { Metadata } from "next";
import { GrowthClient } from "./GrowthClient";

export const metadata: Metadata = {
  title: "Investment Growth Visualizer — ReachFire",
  description: "See compound interest made visceral — the hockey stick moment.",
};

export default function GrowthPage(): React.JSX.Element {
  return <GrowthClient />;
}
