"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Menu, X, Flame, Sun, Moon, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";

const NAV_LINKS = [
  { href: "/calculator", label: "Calculator" },
  { href: "/retirement", label: "Tax Optimizer" },
  { href: "/scenarios", label: "Scenarios" },
  { href: "/withdrawal", label: "Withdrawal" },
  { href: "/coast", label: "Coast FIRE" },
  { href: "/roth-ladder", label: "Roth Ladder" },
  { href: "/geoarbitrage", label: "Geoarbitrage" },
];

const MORE_LINKS = [
  { href: "/healthcare", label: "Healthcare" },
  { href: "/one-decision", label: "One Decision" },
  { href: "/savings-rate", label: "Savings Rate" },
  { href: "/growth", label: "Growth" },
  { href: "/debt", label: "Debt Payoff" },
  { href: "/social-security", label: "Social Security" },
  { href: "/real-estate", label: "Real Estate" },
  { href: "/about", label: "Methodology" },
];

export function Navbar(): React.JSX.Element {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const moreRef = useRef<HTMLDivElement>(null);

  // Close "More" dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent): void {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close mobile menu on route change — use ref to avoid sync setState in effect
  const prevPathname = useRef(pathname);
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      setTimeout(() => setMobileOpen(false), 0);
    }
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Logo size="sm" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition-colors",
                  pathname === link.href
                    ? "text-primary font-medium bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* More dropdown — click-based (touch friendly) */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen((v) => !v)}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors",
                  moreOpen
                    ? "text-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                More
                <ChevronDown className={cn("w-3 h-3 transition-transform duration-150", moreOpen && "rotate-180")} />
              </button>
              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.13 }}
                    className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-border bg-popover shadow-lg overflow-hidden"
                  >
                    {MORE_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMoreOpen(false)}
                        className={cn(
                          "block px-4 py-2 text-sm transition-colors",
                          pathname === link.href
                            ? "text-primary bg-accent"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* CTA + theme toggle + mobile toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link
              href="/calculator"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium gradient-ember text-white shadow-sm hover:opacity-90 transition-opacity"
            >
              Start Planning
            </Link>
            <button
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent/50 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu with animation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <nav className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 gap-0.5">
              {[...NAV_LINKS, ...MORE_LINKS].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-2.5 text-sm rounded-md transition-colors",
                    pathname === link.href
                      ? "text-primary font-medium bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="px-4 pb-4">
              <Link
                href="/calculator"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg gradient-ember text-white font-medium text-sm"
              >
                <Flame className="w-4 h-4" />
                Start Planning
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
