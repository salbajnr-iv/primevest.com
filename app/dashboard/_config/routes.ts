import { ROUTES } from "@/lib/routes";



export type DashboardRoutePath = (typeof ROUTES.dashboard)[keyof typeof ROUTES.dashboard];

export interface DashboardNavItem {
  id: string;
  label: string;
  path: DashboardRoutePath;
}

export interface DashboardNavSection {
  title: string;
  items: DashboardNavItem[];
}

export const DASHBOARD_HOME_ROUTE: DashboardNavItem = {
  id: "dashboard-home",
  label: "Dashboard",
  path: ROUTES.dashboard.home,
};

export const DASHBOARD_SIDEBAR_SECTIONS: DashboardNavSection[] = [
  {
    title: "Account",
    items: [
      { id: "overview", label: "Overview", path: ROUTES.dashboard.overview },
      { id: "assets", label: "Assets", path: ROUTES.dashboard.assetCenter },
      { id: "orders", label: "Order", path: ROUTES.dashboard.orders },
      { id: "portfolio", label: "Portfolio", path: ROUTES.dashboard.portfolio },
      { id: "positions", label: "Positions", path: ROUTES.dashboard.positions },
    ],
  },
  {
    title: "Platform",
    items: [
      { id: "trade", label: "Trade", path: ROUTES.dashboard.trade },
      { id: "buy", label: "Buy", path: ROUTES.dashboard.buy },
      { id: "sell", label: "Sell", path: ROUTES.dashboard.sell },
      { id: "deposit", label: "Deposit", path: ROUTES.dashboard.deposit },
      { id: "swap", label: "Swap", path: ROUTES.dashboard.swap },
    ],
  },
];

export const TRADEW_HEADER_NAV_ITEMS: DashboardNavItem[] = [
  { id: "overview", label: "Overview", path: ROUTES.dashboard.home },
  { id: "trade", label: "Trade", path: ROUTES.dashboard.trade },
  { id: "portfolio", label: "Portfolio", path: ROUTES.dashboard.portfolio },
  { id: "orders", label: "Orders", path: ROUTES.dashboard.orders },
  { id: "assets", label: "Assets", path: ROUTES.dashboard.assetCenter },
];
