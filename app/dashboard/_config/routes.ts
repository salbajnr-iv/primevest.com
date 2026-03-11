export type DashboardRoutePath =
  | "/dashboard"
  | "/dashboard/overview"
  | "/dashboard/asset-center"
  | "/dashboard/trade"
  | "/dashboard/orders"
  | "/dashboard/portfolio"
  | "/dashboard/positions"
  | "/dashboard/buy"
  | "/dashboard/sell"
  | "/dashboard/deposit"
  | "/dashboard/swap";

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
  path: "/dashboard",
};

export const DASHBOARD_SIDEBAR_SECTIONS: DashboardNavSection[] = [
  {
    title: "Account",
    items: [
      { id: "overview", label: "Overview", path: "/dashboard/overview" },
      { id: "assets", label: "Assets", path: "/dashboard/asset-center" },
      { id: "orders", label: "Order", path: "/dashboard/orders" },
      { id: "portfolio", label: "Portfolio", path: "/dashboard/portfolio" },
      { id: "positions", label: "Positions", path: "/dashboard/positions" },
    ],
  },
  {
    title: "Platform",
    items: [
      { id: "trade", label: "Trade", path: "/dashboard/trade" },
      { id: "buy", label: "Buy", path: "/dashboard/buy" },
      { id: "sell", label: "Sell", path: "/dashboard/sell" },
      { id: "deposit", label: "Deposit", path: "/dashboard/deposit" },
      { id: "swap", label: "Swap", path: "/dashboard/swap" },
    ],
  },
];

export const TRADEW_HEADER_NAV_ITEMS: DashboardNavItem[] = [
  { id: "overview", label: "Overview", path: "/dashboard" },
  { id: "trade", label: "Trade", path: "/dashboard/trade" },
  { id: "portfolio", label: "Portfolio", path: "/dashboard/portfolio" },
  { id: "orders", label: "Orders", path: "/dashboard/orders" },
  { id: "assets", label: "Assets", path: "/dashboard/asset-center" },
];
