import { useLocation } from "react-router";
import { ChevronRight } from "lucide-react";
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
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="hidden md:inline text-[10px] font-medium tracking-[.12em] uppercase text-muted-foreground border border-border rounded-sm px-1.5 py-0.5 font-mono">
          WIII / CGK
        </span>
        <SurveyYearSelector selectedYear={selectedYear} onYearChange={onYearChange} />
        <ThemeToggle />
        <AdminHeaderControl />
      </div>
    </header>
  );
}
