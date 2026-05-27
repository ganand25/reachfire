"use client";
import { PageEnter } from "@/components/Animated";

import { useState, useMemo, useCallback } from "react";
import { Globe, Shield, Wifi } from "lucide-react";
import { CurrencyInput } from "@/components/CurrencyInput";
import { ExportBar } from "@/components/ExportBar";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { downloadCSV } from "@/lib/csv";
import { citiesData } from "@/lib/data/costOfLiving";
import { geoarbitrageComparison } from "@/lib/calculations/geoarbitrage";
import { cn } from "@/lib/utils";

interface GeoarbitrageInputs {
  baseCity: string;
  annualExpenses: number;
  currentPortfolio: number;
  monthlySavings: number;
}

const DEFAULT_INPUTS: GeoarbitrageInputs = {
  baseCity: "san-francisco",
  annualExpenses: 80000,
  currentPortfolio: 200000,
  monthlySavings: 4000,
};

export function GeoarbitrageClient(): React.JSX.Element {
  const [inputs, setInputs, clearInputs] = useLocalStorage<GeoarbitrageInputs>(
    "reachfire:geoarbitrage",
    DEFAULT_INPUTS
  );
  const { baseCity, annualExpenses, currentPortfolio, monthlySavings } = inputs;
  const setBaseCity = (v: string): void => setInputs((prev) => ({ ...prev, baseCity: v }));
  const setAnnualExpenses = (v: number): void => setInputs((prev) => ({ ...prev, annualExpenses: v }));
  const setCurrentPortfolio = (v: number): void => setInputs((prev) => ({ ...prev, currentPortfolio: v }));
  const setMonthlySavings = (v: number): void => setInputs((prev) => ({ ...prev, monthlySavings: v }));
  const [filterRegion, setFilterRegion] = useState<"all" | "domestic" | "international">("all");
  const [filterVisa, setFilterVisa] = useState(false);

  const baseCityData = citiesData.find((c) => c.id === baseCity);
  const baseFireNumber = (annualExpenses / 0.04);

  const results = useMemo(
    () => geoarbitrageComparison(baseCity, annualExpenses, 0.04, currentPortfolio, monthlySavings, 0.07),
    [baseCity, annualExpenses, currentPortfolio, monthlySavings]
  );

  const filteredResults = results.filter((r) => {
    const city = citiesData.find((c) => c.id === r.cityId);
    if (!city) return false;
    if (filterRegion !== "all" && city.region !== filterRegion) return false;
    if (filterVisa && !city.visaFriendly) return false;
    return true;
  });

  const handleExportCSV = useCallback(() => {
    const headers = ["City", "Country", "FIRE Number", "Savings vs Home", "Safety", "Healthcare", "Internet (Mbps)"];
    const rows = filteredResults.map((r) => {
      const city = citiesData.find((c) => c.id === r.cityId);
      const savings = baseFireNumber - r.adjustedFireNumber;
      return [
        city?.name ?? r.cityId,
        city?.country ?? "",
        Math.round(r.adjustedFireNumber),
        Math.round(savings),
        city?.safetyIndex ?? "",
        city?.healthcareIndex ?? "",
        city?.internetSpeedMbps ?? "",
      ];
    });
    downloadCSV("reachfire-geoarbitrage", headers, rows);
  }, [filteredResults, baseFireNumber]);

  function formatMoney(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v.toFixed(0)}`;
  }

  return (
    <PageEnter>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">Geoarbitrage Explorer</h1>
        <p className="text-muted-foreground max-w-2xl">
          Your FIRE number in San Francisco becomes a fraction of that in Lisbon or Chiang Mai. See exactly how much you save by relocating.
        </p>
        <ExportBar
          onExportCSV={handleExportCSV}
          onReset={clearInputs}
          className="no-print mt-3"
        />
      </div>

      {/* Inputs */}
      <div className="rounded-xl border border-border bg-card p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Your Home City</label>
            <select
              value={baseCity}
              onChange={(e) => setBaseCity(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {citiesData
                .filter((c) => c.region === "domestic")
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              <optgroup label="──────">
                {citiesData
                  .filter((c) => c.region === "international")
                  .slice(0, 5)
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </optgroup>
            </select>
          </div>
          <CurrencyInput label="Annual Expenses" value={annualExpenses} onChange={setAnnualExpenses} />
          <CurrencyInput label="Current Portfolio" value={currentPortfolio} onChange={setCurrentPortfolio} />
          <CurrencyInput label="Monthly Savings" value={monthlySavings} onChange={setMonthlySavings} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Your FIRE Number</label>
            <div className="flex items-center h-9 px-3 rounded-lg border border-border bg-background/50">
              <span className="text-sm font-bold gradient-ember-text">{formatMoney(baseFireNumber)}</span>
            </div>
            <p className="text-xs text-muted-foreground">in {baseCityData?.name ?? "home city"}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(["all", "domestic", "international"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setFilterRegion(r)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs border transition-colors",
              filterRegion === r
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {r === "all" ? "All Cities" : r === "domestic" ? "🇺🇸 US Only" : "🌍 International"}
          </button>
        ))}
        <button
          onClick={() => setFilterVisa(!filterVisa)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs border transition-colors",
            filterVisa
              ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          Visa-Friendly Only
        </button>
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResults.slice(0, 18).map((result) => {
          const city = citiesData.find((c) => c.id === result.cityId);
          if (!city) return null;
          const savings = baseFireNumber - result.adjustedFireNumber;
          const savingsPct = (savings / baseFireNumber) * 100;
          return (
            <div key={result.cityId} className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                    <h3 className="font-semibold text-sm">{city.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{city.country}</p>
                </div>
                <div className="flex gap-1 flex-wrap justify-end">
                  {city.visaFriendly && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Visa ✓
                    </span>
                  )}
                  {city.englishSpeaking && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      EN
                    </span>
                  )}
                </div>
              </div>

              {/* FIRE number */}
              <div className="mb-3">
                <div className="text-2xl font-bold tabular-nums gradient-ember-text">
                  {formatMoney(result.adjustedFireNumber)}
                </div>
                <div className="text-xs text-muted-foreground">FIRE number here</div>
              </div>

              {/* Savings */}
              {savings > 0 ? (
                <div className="text-xs text-emerald-400 mb-3">
                  Save {formatMoney(savings)} ({savingsPct.toFixed(0)}%) vs {baseCityData?.name?.split(",")[0]}
                </div>
              ) : (
                <div className="text-xs text-amber-400 mb-3">
                  {formatMoney(Math.abs(savings))} more expensive than home
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-xs text-center border-t border-border/50 pt-3">
                <div>
                  <div className="font-medium flex items-center justify-center gap-1">
                    <Shield className="w-3 h-3" />
                    {city.safetyIndex}
                  </div>
                  <div className="text-muted-foreground">Safety</div>
                </div>
                <div>
                  <div className="font-medium">{city.healthcareIndex}/100</div>
                  <div className="text-muted-foreground">Health</div>
                </div>
                <div>
                  <div className="font-medium flex items-center justify-center gap-1">
                    <Wifi className="w-3 h-3" />
                    {city.internetSpeedMbps}
                  </div>
                  <div className="text-muted-foreground">Mbps</div>
                </div>
              </div>

              {city.monthlyBudgetUSD && (
                <div className="mt-2 pt-2 border-t border-border/30 text-xs text-muted-foreground text-center">
                  ~${city.monthlyBudgetUSD.toLocaleString()}/mo comfortable budget
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredResults.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No cities match your filters. Try adjusting the criteria.</p>
        </div>
      )}
    </div>
    </PageEnter>
  );
}
