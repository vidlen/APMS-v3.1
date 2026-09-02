import { useState } from "react";
import { Navigate } from "react-router";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/data-store";
import YearManager from "@/components/admin/YearManager";
import SectionEditorTable from "@/components/admin/SectionEditorTable";
import SampleUnitTable from "@/components/admin/SampleUnitTable";
import ImportExportPanel from "@/components/admin/ImportExportPanel";
import RepairLogPanel from "@/components/admin/RepairLogPanel";

type AdminTab = "pci" | "risk";

const ADMIN_TABS: { id: AdminTab; label: string }[] = [
  { id: "pci", label: "Pavement Condition Index (PCI)" },
  { id: "risk", label: "Risk Management" },
];

export default function Admin() {
  const { isAdmin, authReady } = useAuth();
  const { years } = useData();
  const [selectedYear, setSelectedYear] = useState<string>(() => years[0]?.id ?? "2025");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("pci");

  if (!authReady) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  const handleSelectYear = (year: string) => {
    setSelectedYear(year);
    setExpandedSection(null);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Admin sub-area tabs — the record type being edited, not app-wide
          navigation (that's the sidebar now). Year selection stays outside
          since every tab below reads the same selectedYear. */}
      <div
        className="shrink-0 flex items-center gap-[30px] bg-card border-b border-border z-20 px-4 overflow-x-auto"
        role="tablist"
      >
        {ADMIN_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            aria-selected={activeTab === tab.id}
            role="tab"
            className={`shrink-0 py-2.5 font-condensed text-[12.5px] font-semibold tracking-[.13em] uppercase border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${
              activeTab === tab.id
                ? "text-foreground border-b-primary"
                : "text-muted-foreground border-b-transparent hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <div className="max-w-4xl mx-auto space-y-6">
          <YearManager selectedYear={selectedYear} onSelectYear={handleSelectYear} />

          {activeTab === "pci" && (
            <>
              <div className="panel-surface rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <h2 className="panel-label">Section PCI — {selectedYear}</h2>
                </div>
                <SectionEditorTable year={selectedYear} onEditUnits={setExpandedSection} />
              </div>

              {expandedSection && (
                <SampleUnitTable
                  year={selectedYear}
                  section={expandedSection}
                  onClose={() => setExpandedSection(null)}
                />
              )}

              <ImportExportPanel year={selectedYear} />
            </>
          )}

          {activeTab === "risk" && <RepairLogPanel year={selectedYear} />}
        </div>
      </div>
    </div>
  );
}
