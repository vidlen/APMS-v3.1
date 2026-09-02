import { Gauge, Map, Rows3, TriangleAlert, Database, type LucideIcon } from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Analysis",
    items: [
      { id: "overview", label: "Overview", path: "/", icon: Gauge },
      { id: "map", label: "Pavement Map", path: "/map", icon: Map },
      { id: "sections", label: "Sections", path: "/sections", icon: Rows3 },
      { id: "risk", label: "Risk Analysis", path: "/risk", icon: TriangleAlert },
    ],
  },
  {
    label: "System",
    items: [{ id: "admin", label: "Admin", path: "/admin", icon: Database }],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
