import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useOutletContext, useSearchParams } from "react-router";
import { Construction } from "lucide-react";
import MapView, { type MapViewHandle } from "@/components/MapView";
import DetailPanel from "@/components/DetailPanel";
import Legend from "@/components/Legend";
import PciScalePanel from "@/components/PciScalePanel";
import MapToolbar from "@/components/map/map-toolbar";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePavementData } from "@/hooks/usePavementData";
import { usePciScalePanel } from "@/hooks/usePciScalePanel";
import { countByCondition, parsePCIValue, type SectionData } from "@/lib/pci-utils";
import { useData } from "@/lib/data-store";
import type { ShellOutletContext } from "@/components/app-shell/app-shell";

export default function PavementMap() {
  const { selectedYear } = useOutletContext<ShellOutletContext>();
  const { sections, error } = usePavementData(selectedYear);
  const { years } = useData();
  const showPciData = years.find((y) => y.id === selectedYear)?.hasData ?? false;
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const mapRef = useRef<MapViewHandle>(null);

  const [selectedSection, setSelectedSection] = useState<SectionData | null>(null);
  const [detailedSection, setDetailedSection] = useState<string | null>(null);
  const [activeBands, setActiveBands] = useState<Set<string>>(new Set());
  const [noBranchNotice, setNoBranchNotice] = useState(false);
  const { docked: panelDocked, pos: panelPos, setDocked: setPanelDocked, setPos: setPanelPos } =
    usePciScalePanel();
  const bandCounts = useMemo(() => countByCondition(sections), [sections]);

  // Preselect a section carried over via ?section=... (e.g. from Overview's
  // Needs Attention list) — one-shot once data is available, then the param
  // is dropped so it doesn't fight manual selection afterward.
  useEffect(() => {
    const target = searchParams.get("section");
    if (!target || sections.length === 0) return;
    const match = sections.find((s) => s.Section === target);
    if (match) setSelectedSection(match);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("section");
        return next;
      },
      { replace: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections]);

  const handleFeatureClick = useCallback((section: SectionData | null) => {
    setSelectedSection(section);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedSection(null);
    setDetailedSection(null);
  }, []);

  const handleToggleDetails = useCallback((sectionName: string) => {
    setDetailedSection((prev) => (prev === sectionName ? null : sectionName));
  }, []);

  const handleExitDetails = useCallback(() => setDetailedSection(null), []);

  const handleToggleBand = useCallback((label: string) => {
    setActiveBands((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }, []);

  const handleClearBands = useCallback(() => setActiveBands(new Set()), []);

  const notifyNoBranch = useCallback(() => {
    setNoBranchNotice(true);
    window.setTimeout(() => setNoBranchNotice(false), 2000);
  }, []);

  // Falls back to the parent section's aggregate data once a sample-unit
  // detail view is exited, so the panel doesn't keep showing a single
  // unit's PCI after the map returns to section-overview polygons.
  useEffect(() => {
    if (detailedSection === null && selectedSection?.sampleUnit !== undefined) {
      const parent = sections.find((s) => s.Section === selectedSection.Section);
      setSelectedSection(parent ?? null);
    }
  }, [detailedSection, selectedSection, sections]);

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

  const showContextPanel = Boolean(selectedSection) || panelDocked;

  const mapPane = (
    <div className="relative w-full h-full">
      <MapView
        ref={mapRef}
        key={selectedYear}
        selectedYear={selectedYear}
        onFeatureClick={handleFeatureClick}
        selectedSection={selectedSection}
        detailedSection={detailedSection}
        onExitDetails={handleExitDetails}
        activeBands={activeBands}
        onClearBands={handleClearBands}
      />
      <MapToolbar
        sections={sections}
        selectedSection={selectedSection}
        onSelectSection={handleFeatureClick}
        onFitExtent={() => mapRef.current?.fitToExtent()}
        legendActive={panelDocked}
        onToggleLegend={() => setPanelDocked(!panelDocked)}
      />
      {!panelDocked && (
        <PciScalePanel
          pciValue={selectedSection ? parsePCIValue(selectedSection["PCI Rating"]) : undefined}
          docked={false}
          onToggleDock={() => setPanelDocked(true)}
          pos={panelPos}
          onPosChange={setPanelPos}
          activeBands={activeBands}
          onToggleBand={handleToggleBand}
          bandCounts={bandCounts}
          onEmptyClick={notifyNoBranch}
        />
      )}
    </div>
  );

  const contextPanel = selectedSection ? (
    <DetailPanel
      section={selectedSection}
      selectedYear={selectedYear}
      onClose={handleClosePanel}
      onViewDetails={handleToggleDetails}
      isDetailedView={detailedSection === selectedSection.Section}
      panelDocked={panelDocked}
      onTogglePanelDock={() => setPanelDocked(false)}
      activeBands={activeBands}
      onToggleBand={handleToggleBand}
      bandCounts={bandCounts}
      onEmptyClick={notifyNoBranch}
    />
  ) : (
    <Legend
      activeBands={activeBands}
      onToggleBand={handleToggleBand}
      onClearBands={handleClearBands}
      bandCounts={bandCounts}
      onEmptyClick={notifyNoBranch}
      onExpand={() => setPanelDocked(false)}
    />
  );

  return (
    <div className="relative flex-1 flex min-h-0">
      {noBranchNotice && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="px-4 py-2 rounded-full bg-popover border border-border shadow-lg text-sm font-medium text-foreground">
            No Branch Found
          </div>
        </div>
      )}

      {isMobile ? (
        <>
          <div className="relative flex-1 min-w-0">{mapPane}</div>
          <Sheet
            open={showContextPanel}
            onOpenChange={(open) => {
              if (!open) handleClosePanel();
            }}
          >
            <SheetContent side="bottom" className="max-h-[40vh] p-0 overflow-y-auto custom-scrollbar">
              <SheetHeader className="sr-only">
                <SheetTitle>{selectedSection ? selectedSection.Section : "Legend"}</SheetTitle>
              </SheetHeader>
              {contextPanel}
            </SheetContent>
          </Sheet>
        </>
      ) : showContextPanel ? (
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={72} minSize={45}>
            {mapPane}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            defaultSize={28}
            minSize={20}
            maxSize={45}
            className="bg-card border-l border-border overflow-y-auto custom-scrollbar"
          >
            {contextPanel}
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <div className="relative flex-1 min-w-0">{mapPane}</div>
      )}
    </div>
  );
}
