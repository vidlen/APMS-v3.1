import { useMemo } from "react";
import { useOutletContext } from "react-router";
import { Construction } from "lucide-react";
import RiskTab from "@/components/risk/RiskTab";
import { usePavementData } from "@/hooks/usePavementData";
import { useData, useRepairLog } from "@/lib/data-store";
import { aggregateRepairLog } from "@/lib/repair-log";
import type { ShellOutletContext } from "@/components/app-shell/app-shell";

export default function RiskAnalysis() {
  const { selectedYear } = useOutletContext<ShellOutletContext>();
  const { sections, unitsBySection, error } = usePavementData(selectedYear);
  const { years } = useData();
  const { records: repairLogRecords } = useRepairLog();
  const showPciData = years.find((y) => y.id === selectedYear)?.hasData ?? false;

  // Aggregated against THIS year's branch set — see Home.tsx's original
  // comment: resolveBranch only accepts a location match that exists in the
  // currently loaded network, so this has to track the year, not be fixed.
  const repairLogAggregate = useMemo(() => {
    const knownBranches = new Set(sections.map((s) => s.Section));
    return aggregateRepairLog(repairLogRecords, knownBranches);
  }, [sections, repairLogRecords]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-0 bg-background">
        <div className="text-center space-y-3 max-w-md px-6">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <span className="text-destructive text-xl">!</span>
          </div>
          <p className="text-foreground font-medium">Failed to load data</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!showPciData) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-0 bg-background">
        <div className="text-center space-y-3 max-w-sm px-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Construction size={20} className="text-primary" />
          </div>
          <p className="text-foreground font-medium">{selectedYear} Risk Management</p>
          <p className="text-muted-foreground text-sm">No PCI survey data loaded for this year yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-background">
      <RiskTab
        sections={sections}
        selectedYear={selectedYear}
        unitsBySection={unitsBySection}
        repairLogByBranch={repairLogAggregate.byBranch}
        repairLogStats={repairLogAggregate.stats}
      />
    </div>
  );
}
