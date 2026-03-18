import * as React from "react";

type LucideProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string;
};

function createIcon(displayName: string) {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
  Icon.displayName = displayName;
  return Icon;
}

export const AlertCircle = createIcon("AlertCircle");
export const AlertTriangle = createIcon("AlertTriangle");
export const ArrowDownRight = createIcon("ArrowDownRight");
export const ArrowLeftRight = createIcon("ArrowLeftRight");
export const ArrowRight = createIcon("ArrowRight");
export const ArrowUpRight = createIcon("ArrowUpRight");
export const BarChart3 = createIcon("BarChart3");
export const Calendar = createIcon("Calendar");
export const CalendarRange = createIcon("CalendarRange");
export const Check = createIcon("Check");
export const CheckSquare = createIcon("CheckSquare");
export const ChevronDown = createIcon("ChevronDown");
export const ChevronUp = createIcon("ChevronUp");
export const ClipboardList = createIcon("ClipboardList");
export const Clock = createIcon("Clock");
export const Copy = createIcon("Copy");
export const DollarSign = createIcon("DollarSign");
export const Download = createIcon("Download");
export const Headphones = createIcon("Headphones");
export const LayoutDashboard = createIcon("LayoutDashboard");
export const Loader2 = createIcon("Loader2");
export const Mail = createIcon("Mail");
export const MessageCircle = createIcon("MessageCircle");
export const Monitor = createIcon("Monitor");
export const Phone = createIcon("Phone");
export const Plus = createIcon("Plus");
export const RefreshCw = createIcon("RefreshCw");
export const Search = createIcon("Search");
export const Settings = createIcon("Settings");
export const Shield = createIcon("Shield");
export const ShieldCheck = createIcon("ShieldCheck");
export const Star = createIcon("Star");
export const TrendingDown = createIcon("TrendingDown");
export const TrendingUp = createIcon("TrendingUp");
export const Users = createIcon("Users");
export const Wallet = createIcon("Wallet");
export const Zap = createIcon("Zap");
export const Bell = createIcon("Bell");
export const BookOpen = createIcon("BookOpen");
export const CircleHelp = createIcon("CircleHelp");
export const Compass = createIcon("Compass");
export const Contact = createIcon("Contact");
export const Home = createIcon("Home");
export const LineChart = createIcon("LineChart");
export const ListOrdered = createIcon("ListOrdered");
export const Lock = createIcon("Lock");
export const Newspaper = createIcon("Newspaper");
export const PlusCircle = createIcon("PlusCircle");
export const UserCog = createIcon("UserCog");

export const Save = createIcon("Save");
export const User = createIcon("User");
