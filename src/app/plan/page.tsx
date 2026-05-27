import type { Metadata } from "next";
import { Suspense } from "react";
import { PlanWizardClient } from "./PlanWizardClient";

export const metadata: Metadata = {
  title: "Start Planning — ReachFire",
  description: "Answer a few questions and we'll show you the right tools for your financial independence journey.",
};

export default function PlanPage(): React.JSX.Element {
  return (
    <Suspense>
      <PlanWizardClient />
    </Suspense>
  );
}
