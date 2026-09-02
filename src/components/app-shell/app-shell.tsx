import { useState } from "react";
import { Outlet } from "react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-shell/app-sidebar";
import TopBar from "@/components/app-shell/top-bar";
import type { SurveyYear } from "@/lib/survey-years";

export interface ShellOutletContext {
  selectedYear: SurveyYear;
  setSelectedYear: (year: SurveyYear) => void;
}

export default function AppShell() {
  const [selectedYear, setSelectedYear] = useState<SurveyYear>("2025");

  return (
    <SidebarProvider style={{ "--sidebar-width-icon": "4.5rem" } as React.CSSProperties}>
      <AppSidebar />
      <SidebarInset className="h-svh overflow-hidden">
        <TopBar selectedYear={selectedYear} onYearChange={setSelectedYear} />
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <Outlet context={{ selectedYear, setSelectedYear } satisfies ShellOutletContext} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
