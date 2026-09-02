import { Maximize, ListFilter } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import type { SectionData } from "@/lib/pci-utils";

interface MapToolbarProps {
  sections: SectionData[];
  selectedSection: SectionData | null;
  onSelectSection: (section: SectionData) => void;
  onFitExtent: () => void;
  legendActive: boolean;
  onToggleLegend: () => void;
}

export default function MapToolbar({
  sections,
  selectedSection,
  onSelectSection,
  onFitExtent,
  legendActive,
  onToggleLegend,
}: MapToolbarProps) {
  return (
    <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
      <SearchBar sections={sections} onSelect={onSelectSection} selectedSection={selectedSection} />
      <button
        onClick={onFitExtent}
        title="Fit to network extent"
        aria-label="Fit to network extent"
        className="panel-surface flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Maximize size={14} />
      </button>
      <button
        onClick={onToggleLegend}
        title="Toggle legend panel"
        aria-label="Toggle legend panel"
        aria-pressed={legendActive}
        className={`panel-surface flex items-center justify-center w-8 h-8 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          legendActive ? "text-primary border-primary/40" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <ListFilter size={14} />
      </button>
    </div>
  );
}
