import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router";
import { Construction } from "lucide-react";
import SectionsTable from "@/components/SectionsTable";
import { usePavementData } from "@/hooks/usePavementData";
import { useData } from "@/lib/data-store";
import type { SectionData } from "@/lib/pci-utils";
import type { ShellOutletContext } from "@/components/app-shell/app-shell";

export default function Sections() {
  const { selectedYear } = useOutletContext<ShellOutletContext>();
  const { sections, error } = usePavementData(selectedYear);
  const { years } = useData();
  const showPciData = years.find((y) => y.id === selectedYear)?.hasData ?? false;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeBands, setActiveBands] = useState<Set<string>>(new Set());

  // Seed the condition filter from ?bands=... (e.g. Overview's "+N more
  // below Satisfactory" link) — one-shot on arrival.
  useEffect(() => {
    const raw = searchParams.get("bands");
    if (!raw) return;
    setActiveBands(new Set(raw.split(",").filter(Boolean)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (section: SectionData) => {
    navigate(`/map?section=${encodeURIComponent(section.Section)}`);
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
    <div className="flex-1 min-h-0 max-w-4xl w-full mx-auto">
      <SectionsTable
        sections={sections}
        activeBands={activeBands}
        onClearBands={() => setActiveBands(new Set())}
        selectedSection={null}
        onSelect={handleSelect}
        onClose={() => navigate("/map")}
      />
    </div>
  );
}
