import type { Metadata } from "next";
import { FamilyTaxClient } from "./FamilyTaxClient";

export const metadata: Metadata = {
  title: "Total Family Tax Optimizer — ReachFire",
  description:
    "The only FIRE calculator that quantifies what your kids will pay. Optimize your family's lifetime tax across parent income tax, IRMAA, ACA subsidies, and SECURE Act heir tax.",
};

export default function FamilyTaxPage(): React.JSX.Element {
  return <FamilyTaxClient />;
}
