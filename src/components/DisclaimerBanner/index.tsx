import Link from "next/link";
import { TriangleAlert } from "lucide-react";

interface DisclaimerBannerProps {
  context?: string; // e.g. "tax", "social security", "withdrawal", "healthcare"
}

const CONTEXT_MESSAGES: Record<string, string> = {
  tax: "Tax calculations are estimates based on 2025 IRS brackets. Tax law changes frequently. Consult a CPA before making Roth conversion or tax planning decisions.",
  "social security": "Social Security estimates are approximations based on the SSA bend-point formula. Actual benefits depend on your complete earnings record. Verify at SSA.gov.",
  withdrawal: "Withdrawal projections use historical returns and mathematical models. They do not guarantee future portfolio survival. Sequence-of-returns risk is real.",
  healthcare: "Healthcare cost estimates vary significantly by state, plan, health status, and future policy changes. Verify current premiums at HealthCare.gov or Medicare.gov.",
  debt: "Payoff projections assume consistent minimum payments and no new debt. Actual results depend on lender terms and payment behavior.",
  default: "Projections are hypothetical and based on historical data. Past performance does not guarantee future results.",
};

export function DisclaimerBanner({ context = "default" }: DisclaimerBannerProps): React.JSX.Element {
  const message = CONTEXT_MESSAGES[context] ?? CONTEXT_MESSAGES.default;

  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs text-muted-foreground">
      <TriangleAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
      <p>
        <strong className="text-foreground">Not financial advice.</strong>{" "}
        {message}{" "}
        <Link href="/terms" className="underline hover:text-foreground">
          Terms
        </Link>
        {" · "}
        <Link href="/about" className="underline hover:text-foreground">
          Methodology
        </Link>
      </p>
    </div>
  );
}
