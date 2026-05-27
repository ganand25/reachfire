import Link from "next/link";
import { Shield } from "lucide-react";
import { Logo } from "@/components/Logo";

const TOOL_LINKS = [
  { href: "/calculator", label: "FIRE Calculator" },
  { href: "/retirement", label: "Tax Optimizer" },
  { href: "/family-tax", label: "Total Family Tax" },
  { href: "/scenarios", label: "Scenario Comparison" },
  { href: "/withdrawal", label: "Withdrawal Simulator" },
  { href: "/coast", label: "Coast FIRE" },
  { href: "/roth-ladder", label: "Roth Ladder" },
  { href: "/geoarbitrage", label: "Geoarbitrage" },
  { href: "/healthcare", label: "Healthcare Costs" },
  { href: "/one-decision", label: "One Decision" },
  { href: "/savings-rate", label: "Savings Rate" },
  { href: "/growth", label: "Investment Growth" },
  { href: "/debt", label: "Debt Payoff" },
  { href: "/social-security", label: "Social Security" },
  { href: "/real-estate", label: "Real Estate" },
];

export function Footer(): React.JSX.Element {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Logo size="md" />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Free FIRE calculator with geoarbitrage, Roth ladder planning, and AI insights. Your data never leaves your browser.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Your data never leaves your browser</span>
            </div>
          </div>

          {/* Tools */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Tools</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {TOOL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Learn</p>
            <div className="space-y-1.5">
              {[
                { href: "/about", label: "Methodology" },
                { href: "/about#assumptions", label: "Assumptions" },
                { href: "/about#sources", label: "Data Sources" },
                { href: "/terms", label: "Terms of Service" },
                { href: "/privacy", label: "Privacy Policy" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-6 p-3 rounded-lg bg-card border border-border">
              <p className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">100% Private.</span>{" "}
                All calculations run entirely in your browser using JavaScript. No account required. No data stored. No tracking.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © 2026 ReachFire. Free forever.{" "}
            <strong className="text-foreground">Not financial advice.</strong>{" "}
            <Link href="/terms" className="underline hover:text-foreground">Terms</Link>
            {" · "}
            <Link href="/privacy" className="underline hover:text-foreground">Privacy</Link>
          </p>
          <p className="text-xs text-muted-foreground">
            Historical data: Shiller dataset · Trinity Study · IRS 2025 brackets
          </p>
        </div>
      </div>
    </footer>
  );
}
