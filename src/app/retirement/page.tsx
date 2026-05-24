import type { Metadata } from "next";
import { RetirementClient } from "./RetirementClient";

export const metadata: Metadata = {
  title: "Retirement Tax Optimizer — ReachFire",
  description:
    "Minimize lifetime taxes in retirement. Compare Traditional, Roth, and taxable withdrawal strategies with Roth conversion planning, 0% LTCG harvesting, and gift tax strategies.",
};

export default function RetirementPage(): React.JSX.Element {
  return <RetirementClient />;
}
