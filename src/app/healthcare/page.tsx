import type { Metadata } from "next";
import { HealthcareClient } from "./HealthcareClient";

export const metadata: Metadata = {
  title: "Healthcare Cost Estimator — ReachFire",
  description: "Project pre-65 ACA premiums, Medicare costs, HSA optimization, and medical tourism savings for your FIRE plan.",
};

export default function HealthcarePage(): React.JSX.Element {
  return <HealthcareClient />;
}
