import { useNavigate, useOutletContext } from "react-router";
import { Construction } from "lucide-react";
import StatsBar from "@/components/StatsBar";
import NeedsAttention from "@/components/NeedsAttention";
import { usePavementData } from "@/hooks/usePavementData";
import { pciCategories, type SectionData } from "@/lib/pci-utils";
import { useData } from "@/lib/data-store";
import type { ShellOutletContext } from "@/components/app-shell/app-shell";

export default function Overview() {
  const { selectedYear } = useOutletContext<ShellOutletContext>();
  const { sections, loading, error } = usePavementData(selectedYear);
  const { years } = useData();
  const navigate = useNavigate();
  const showPciData = years.find((y) => y.id === selectedYear)?.hasData ?? false;

  const handleSelect = (section: SectionData) => {
    navigate(`/map?section=${encodeURIComponent(section.Section)}`);
  };

  const handleShowBelowSatisfactory = () => {
    const labels = ["Fair", "Poor", "Very Poor", "Serious", "Failed"];
    navigate(`/sections?bands=${encodeURIComponent(labels.join(","))}`);
  };

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
          <p className="text-foreground font-medium">{selectedYear} PCI Survey</p>
          <p className="text-muted-foreground text-sm">This Feature Is Closed Due To WIP</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-background">
      {loading ? (
        <div className="p-5 space-y-4 animate-pulse">
          <div className="h-4 w-32 bg-muted rounded-sm" />
          <div className="h-16 bg-muted rounded-md" />
          <div className="h-4 w-24 bg-muted rounded-sm" />
          <div className="h-40 bg-muted rounded-md" />
        </div>
      ) : (
        <div className="max-w-3xl">
          <StatsBar sections={sections} onOpenTable={() => navigate("/sections")} />
          <NeedsAttention
            sections={sections}
            onSelect={handleSelect}
            onShowBelowSatisfactory={handleShowBelowSatisfactory}
          />
          <div className="px-5 py-5 border-b border-border">
            <h2 className="panel-label mb-3">Data context</h2>
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
              <span>
                Survey year <span className="font-mono text-foreground">{selectedYear}</span>
              </span>
              <span>
                Branches <span className="font-mono text-foreground tabular-nums">{sections.length}</span>
              </span>
              <span>
                Bands <span className="font-mono text-foreground tabular-nums">{pciCategories.length}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
