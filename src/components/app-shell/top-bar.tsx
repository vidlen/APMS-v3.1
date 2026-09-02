import { useLocation } from "react-router";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { ALL_NAV_ITEMS } from "@/config/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import SurveyYearSelector from "@/components/SurveyYearSelector";
import ThemeToggle from "@/components/theme/theme-toggle";
import AdminHeaderControl from "@/components/admin/AdminHeaderControl";
import type { SurveyYear } from "@/lib/survey-years";

interface TopBarProps {
  selectedYear: SurveyYear;
  onYearChange: (year: SurveyYear) => void;
}

export default function TopBar({ selectedYear, onYearChange }: TopBarProps) {
  const location = useLocation();
  const activeItem = ALL_NAV_ITEMS.find((item) => item.path === location.pathname);
  // Admin manages its own per-record year state via YearManager (a richer
  // "administer this year's dataset" control, not just "view this year") -
  // showing the shared viewing-year selector alongside it would be a second,
  // unsynced year picker, so it's swapped for an ADMIN MODE badge instead.
  const isAdmin = location.pathname === "/admin";

  return (
    <header className="shrink-0 flex items-center justify-between gap-4 min-h-[56px] px-3 pt-[env(safe-area-inset-top)] bg-card border-b border-border z-30">
      <div className="flex items-center gap-2 min-w-0">
        <SidebarTrigger />
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 min-w-0 text-[12.5px]">
          <span className="text-muted-foreground font-condensed tracking-[.08em] uppercase shrink-0">
            APMS
          </span>
          <ChevronRight size={13} className="text-muted-foreground/60 shrink-0" />
          <span className="text-foreground font-condensed font-semibold tracking-[.05em] uppercase truncate">
            {activeItem?.label ?? "Not Found"}
          </span>
        </nav>
        {isAdmin && (
          <span className="flex items-center gap-1.5 shrink-0 text-[10px] font-condensed font-semibold tracking-[.12em] uppercase text-primary bg-primary/10 border border-primary/30 rounded-sm px-2 py-1">
            <ShieldCheck size={12} />
            Admin Mode
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="hidden md:inline text-[10px] font-medium tracking-[.12em] uppercase text-muted-foreground border border-border rounded-sm px-1.5 py-0.5 font-mono">
          WIII / CGK
        </span>
        {!isAdmin && <SurveyYearSelector selectedYear={selectedYear} onYearChange={onYearChange} />}
        <ThemeToggle />
        <AdminHeaderControl />
      </div>
    </header>
  );
}
