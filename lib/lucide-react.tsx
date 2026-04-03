import * as React from "react";

type LucideProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string;
};

function createIcon(displayName: string, paths: string[]) {
  const Icon = ({ size = 24, ...props }: LucideProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <title>{displayName}</title>
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
  Icon.displayName = displayName;
  return Icon;
}

// Navigation Icons
export const Home = createIcon("Home", [
  "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  "M9 22V12h6v10"
]);

export const LayoutDashboard = createIcon("LayoutDashboard", [
  "M3 13h8V3H3v10z",
  "M13 13h8V3h-8v10z",
  "M3 21h8v-8H3v8z",
  "M13 21h8v-8h-8v8z"
]);

export const Wallet = createIcon("Wallet", [
  "M21 12V7H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16v-5",
  "M3 15h18"
]);

export const Settings = createIcon("Settings", [
  "M14.5 10a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm0 1a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm5.22 3.72a8 8 0 1 1-11.44-11.44 8 8 0 0 1 11.44 11.44ZM9.5 11a2 2 0 1 0 0-4 2 2 0 0 1 0 4Z",
]);

// Action Icons
export const ArrowLeftRight = createIcon("ArrowLeftRight", [
  "M17 5L12 10l5 5",
  "M12 10l-5 5",
  "M12 10l5-5",
  "M7 5l5 5-5 5"
]);

export const ArrowRight = createIcon("ArrowRight", ["M13 7l5 5-5 5"]);
export const ArrowDown = createIcon("ArrowDown", ["M12 5v14", "m19 12-7 7-7-7"]);
export const ArrowUp = createIcon("ArrowUp", ["M12 19V5", "m5 12 7-7 7 7"]);

export const TrendingUp = createIcon("TrendingUp", [
  "m15 15-4-4-4 4",
  "M2 13h6v6",
  "M21 8h-6V2"
]);

export const TrendingDown = createIcon("TrendingDown", [
  "m15 9 4 4-4 4",
  "M21 13h-6v6",
  "M2 9h6V3"
]);

export const PlusCircle = createIcon("PlusCircle", [
  "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z",
  "M12 6v6",
  "M6 12h6"
]);

export const DollarSign = createIcon("DollarSign", [
  "M12 1v22",
  "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
]);

// Chart Icons
export const LineChart = createIcon("LineChart", [
  "M3 19v-8.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5V19",
  "M12.5 19V7a1 1 0 0 0-1-1h-3",
  "M18 19V11a1 1 0 0 0-1-1h-2"
]);

export const BarChart3 = createIcon("BarChart3", [
  "M3 19v-7a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v7",
  "M9 19V8a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v11",
  "M14 19v-6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6"
]);

// Notification Icons
export const AlertCircle = createIcon("AlertCircle", [
  "M12 2v20M2 12h20",
  "M18.364 18.364A9 9 0 0 5.636 5.636"
]);

export const Bell = createIcon("Bell", [
  "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9",
  "M13.73 21a2 2 0 0 1-3.46 0"
]);

export const MessageCircle = createIcon("MessageCircle", [
  "M21 11.5a8.38 8.38 0 0 0-.9-3.8 2.15 2.15 0 0 0-1.67-1.34 2.64 2.64 0 0 0-2.4.75 10.77 10.77 0 0 0-4.6 4.6 2.64 2.64 0 0 0-.75 2.4c0 .59.19 1.18.53 1.68.36.6.84 1.06 1.41 1.35a10.38 10.38 0 0 0 3.8.9 7.5 7.5 0 0 0 3.98-.82 2.64 2.64 0 0 1 2.4-.75 2.15 2.15 0 0 1 1.67.34A8.38 8.38 0 0 0 21 11.5z",
  "m11.94 11.94 3.12-3.12"
]);

export const Newspaper = createIcon("Newspaper", [
  "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z",
  "m22 18-5-5-3 3-2-2-4 4",
  "M4 4v12"
]);

// Security Icons
export const Shield = createIcon("Shield", [
  "M12 3l8 4v5c0 5-3.5 9.74-8 11-4.5-1.26-8-6-8-11V7l8-4z"
]);

export const ShieldCheck = createIcon("ShieldCheck", [
  "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
]);

export const Check = createIcon("Check", ["M20 6L9 17l-5-5"]);
export const CheckCircle = createIcon("CheckCircle", [
  "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z",
  "m9 12 2 2 4-4"
]);

export const Lock = createIcon("Lock", [
  "M18 8h-1V6a2 2 0 0 0-4 0v2h-1a4 4 0 0 0-4 4v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V12a4 4 0 0 0-4-4z",
  "M8 10V6a2 2 0 0 1 4-2 2 2 0 0 1 2 2v4"
]);

// Support Icons
export const Headphones = createIcon("Headphones", [
  "M3 18v-6a9 9 0 0 1 18 0v6",
  "M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-4 0v-2a4 4 0 0 0-8 0v2a2 2 0 0 1-4 0h-1a2 2 0 0 1-2-2"
]);

export const Users = createIcon("Users", [
  "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
  "M21 21v-2a4 4 0 0 0-3-3.87",
  "M16 3.13a4 4 0 0 1 0 7.75",
  "M21 3.13a4 4 0 0 1-3 6.13",
  "M12.6 3.13a4 4 0 0 1 3.74 3.74",
  "M8.6 3.13a4 4 0 0 1 3.74 3.74"
]);

// User Icons
export const User = createIcon("User", [
  "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2",
  "M12.62 20.81a1 1 0 0 1-.81-.41L9 14l-2 2.45a1 1 0 0 1-1.45-.16L4 13.17a.71.71 0 0 1 0-.83L7 10l2 2.44a1 1 0 0 0 1.8-.07L14 8l3 3.73a.75.75 0 0 1 .18.74l-1 2.83a1 1 0 0 1-.82.56z"
]);

// Utility Icons
export const Search = createIcon("Search", [
  "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"
]);

export const ChevronDown = createIcon("ChevronDown", ["M6 9l6 6 6-6"]);

export const ChevronUp = createIcon("ChevronUp", ["M18 15l-6-6-6 6"]);

export const RefreshCw = createIcon("RefreshCw", [
  "M21 9V5m0 4l-2-2M3 19v4m0-4l2 2M21 15h-4m4 0l-2-2M3 9h4m-4 0l2 2"
]);

export const AlertTriangle = createIcon("AlertTriangle", [
  "M21.73 18.27A9.96 9.96 0 0 1 19 21a9.9 9.9 0 0 1-6.76-2.73M9.73 5.73a9.9 9.9 0 0 1 6.76-2.73A9.96 9.96 0 0 1 21 5a9.9 9.9 0 0 1-2.73 6.76",
  "M10.5 15.5L15 10.5"
]);

export const Save = createIcon("Save", [
  "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z",
  "M17 21v-8H7v8",
  "M7 3v5h8"
]);

export const Calendar = createIcon("Calendar", [
  "M16 2h4a1 1 0 0 1 1 1v1H3V3a1 1 0 0 1 1-1h4",
  "M21 10v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10",
  "M8 21V10",
  "M12 21V10",
  "M16 21V10"
]);

export const Compass = createIcon("Compass", [
  "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z",
  "M12 6v12",
  "M12 6l2 10",
  "M12 18l-2-10"
]);

export const Clock = createIcon("Clock", [
  "M12 2a10 10 0 1 0 10 10A10 10 0 0 1 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z",
  "M12 6v6l4 2"
]);

export const Star = createIcon("Star", [
  "M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 1-.475.825h-5.497a.562.562 0 0 1-.474-.825L11.48 3.5z",
  "M5.506 19.523a.562.562 0 0 1-.777 0l-3.16-4.568a.562.562 0 0 1 .306-.92h5.498a.562.562 0 0 1 .306.92l-3.173 4.568z"
]);

export const Zap = createIcon("Zap", [
  "M13 10V3L4 14h7v7l9-11h-7v-2z"
]);

export const RotateCw = createIcon("RotateCw", [
  "M21 4v6h-6",
  "M21 10l-5-5",
  "M3 10h6V4",
  "M7 10l5 5"
]);

export const Sun = createIcon("Sun", [
  "M12 2a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1z",
  "M12 18a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0v-2a1 1 0 0 1 1-1zM4.22 5.72a1 1 0 0 1 1.42 0L7.78 8.3a1 1 0 0 1 0 1.41l-1.06 1.06a1 1 0 0 1-1.42 0 1 1 0 0 1 0-1.41l1.34-1.34a1 1 0 0 0-1.42 0zM18.36 18.78a1 1 0 0 1-1.42 0l-1.34-1.34a1 1 0 0 1 0-1.42 1 1 0 0 1 1.41 0l1.06 1.06a1 1 0 0 1 0 1.41l-1.06 1.06a1 1 0 0 1 1.42 0zM4 12a1 1 0 0 1 1-1h6a1 1 0 0 1 0 2H5a1 1 0 0 1-1-1z",
  "M18 12a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2h-2a1 1 0 0 1-1-1z",
  "M12 5a7 7 0 1 0 7 7 7 7 0 0 0-7-7z"
]);

export const Moon = createIcon("Moon", [
  "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
]);

export const SunIcon = Sun;
export const MoonIcon = Moon;

// Additional exported icons from original
export const ListOrdered = createIcon("ListOrdered", [
  "M11 4H4a1 1 0 0 1 0-2h7a1 1 0 0 1 0 2zm0 4H4a1 1 0 0 1 0-2h7a1 1 0 0 1 0 2zm0 4H4a1 1 0 0 1 0-2h7a1 1 0 0 1 0 2z",
  "M21 6h-2.761a4 4 0 0 0-3.847 3.065L15.761 10H11a1 1 0 0 1 0-2h4.761a2 2 0 0 1 1.923 1.538L19.077 12H21a1 1 0 0 1 0 2h-.077l-.415.828A2 2 0 0 1 18.761 16H14a1 1 0 0 1 0-2h4.761a4 4 0 0 0 3.847-3.065L21.077 14H21a1 1 0 0 1 0-2z"
]);
export const List = ListOrdered;

export const LogOut = createIcon("LogOut", [
  "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",
  "M16 17l5-5-5-5",
  "M21 12H9"
]);

// Loader for loading state
export const Loader2 = createIcon("Loader2", [
  "M15.71 28.29a16 16 0 1 0-28.42 0 16 16 0 1 0 28.42 0zM15.71 28.29a16 16 0 1 0-28.42 0 16 16 0 1 0 28.42 0z",
  "M15.71 8.71a8 8 0 1 1-11.31 11.31 8 8 0 1 1 11.31-11.31z",
  "M15.71 8.71a8 8 0 1 1-11.31 11.31 8 8 0 1 1 11.31-11.31z"
]);
export const Loader = Loader2;

// Fallback/Additional
export const CircleHelp = createIcon("CircleHelp", [
  "M12 2a10 10 0 1 0 10 10A10 10 0 0 1 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z",
  "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
]);
export const HelpCircle = CircleHelp;

export const BookOpen = createIcon("BookOpen", [
  "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z",
  "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
]);

export const Contact = createIcon("Contact", [
  "M22 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4c0 6.25 3.5 10.75 8 12.25V20a1.5 1.5 0 0 0 3 0v-.25c4.5-1.5 8-6 8-12.25z"
]);

export const Monitor = createIcon("Monitor", [
  "M3 17V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  "M17 21H7a1 1 0 0 1 0-2h10a1 1 0 0 1 0 2z"
]);

export const Phone = createIcon("Phone", [
  "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
]);

export const Plus = createIcon("Plus", ["M12 5v14M5 12h14"]);

export const Copy = createIcon("Copy", [
  "M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2",
  "M8 4h8v8H8V4z"
]);

export const Download = createIcon("Download", [
  "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
  "M12 10V2",
  "M7 10l5 5 5-5"
]);

export const Mail = createIcon("Mail", [
  "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z",
  "m22 6-10 5L2 6"
]);

export const ClipboardList = createIcon("ClipboardList", [
  "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",
  "M15 2h-1a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 0-1 1v14a1 1 0 0 1 1 1h16a1 1 0 0 1 1-1V6a1 1 0 0 0-1-1h-1a1 1 0 0 1-1-1V3a1 1 0 0 0-1-1z",
  "M9 10h6",
  "M9 12h4",
  "M7 16h8"
]);

// UserCog (if used)
export const UserCog = createIcon("UserCog", [
  "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
  "M10 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  "M16.71 16.29a3 3 0 1 0 .7 1.7 3 3 0 0 0-.7-1.7z",
  "M20.71 14.29a3 3 0 0 1 0 4.24 3 3 0 0 1-4.24 0 3 3 0 0 1 0-4.24 3 3 0 0 1 4.24 0z"
]);

// Missing icons for error fixes
export const CalendarRange = createIcon("CalendarRange", [
  "M8 2.75a.75.75 0 0 1 1.5 0V4h6V2.75a.75.75 0 0 1 1.5 0V4h.5a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1h.5V2.75a.75.75 0 0 1 1.5 0V4h6V2.75Z",
  "M5 11a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-1Z",
  "M5 15a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-1Z"
]);

export const Grid3x3 = createIcon("Grid3x3", [
  "M2 4v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2Z",
  "M2 10h8V6H2v4Z",
  "M10 10h8V6h-8v4Z",
  "M2 18h8v-4H2v4Z",
  "M10 18h8v-4h-8v4Z"
]);
export const AlignJustify = Grid3x3;
