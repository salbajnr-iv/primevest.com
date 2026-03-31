/**
 * Centralized icon configuration system for PrimeVest
 * Outline and filled icon style with consistent sizing and variants
 * 
 * Icon Style: Professional outline icons with thick strokes (not minimal lines)
 * Size: 18-20px standardized across all components
 * Library: lucide-react (outline by default, filled variants where appropriate)
 */

import React from 'react';
import {
  // Navigation
  Home,
  LayoutDashboard,
  Wallet,
  Settings,
  AlignJustify,
  
  // Theme
  SunIcon,
  MoonIcon,
  
  // Financial Actions
  ArrowLeftRight,
  ArrowRight as ArrowRightIcon,
  ArrowDown as ArrowDownIcon,
  ArrowUp as ArrowUpIcon,
  PlusCircle,
  DollarSign,
  
  // Market & Analytics
  TrendingUp,
  TrendingDown,
  LineChart,
  BarChart3,
  
  // Notifications & Communication
  AlertCircle,
  Bell,
  MessageCircle,
  Newspaper,
  
  // Security & Verification
  ShieldCheck,
  CheckCircle,
  Lock,
  
  // Support & Help
  Headphones,
  Users,
  HelpCircle,
  List,
  
  // User & Account
  User,
  LogOut as LogOutIcon,
  
  // Utility & UI
  Search,
  ChevronDown,
  ChevronUp,
  Loader,
  RefreshCw,
  AlertTriangle,
  Save,
  Calendar,
  Compass,
  Clock,
  Star,
  Zap,
} from 'lucide-react';

/**
 * Lucide Icon type definition
 */
export type LucideIcon = React.ReactNode;

/**
 * Action types for icon mapping
 * Used throughout the app for consistent icon usage
 */
export type IconAction =
  // Navigation
  | 'dashboard'
  | 'dashboard-home'
  | 'wallet'
  | 'settings'
  | 'menu'
  
  // Theme
  | 'sun'
  | 'moon'
  | 'theme-toggle'
  
  // Financial
  | 'transfer'
  | 'withdraw'
  | 'deposit'
  | 'add-funds'
  | 'currency'
  | 'payment'
  
  // Market
  | 'trending-up'
  | 'trending-down'
  | 'chart'
  | 'chart-bar'
  
  // Notifications
  | 'alert'
  | 'notification'
  | 'message'
  | 'news'
  
  // Security
  | 'shield'
  | 'verified'
  | 'lock'
  
  // Support
  | 'support'
  | 'community'
  | 'help'
  | 'ticket'
  
  // User
  | 'profile'
  | 'logout'
  
  // Utility
  | 'search'
  | 'expand'
  | 'collapse'
  | 'loading'
  | 'refresh'
  | 'warning'
  | 'save'
  | 'calendar'
  | 'strategies'
  | 'orders'
  | 'lightning'
  | 'premium'
  | 'navigation'
  | 'time';

/**
 * Icon configuration mapping
 * Each action type maps to a lucide-react icon component
 * All icons use outline style for consistency
 */
export const ICON_CONFIG: Record<IconAction, { icon: React.ComponentType<any>; label: string }> = {
  // Navigation
  dashboard: { icon: LayoutDashboard, label: 'Dashboard' },
  'dashboard-home': { icon: Home, label: 'Dashboard Home' },
  wallet: { icon: Wallet, label: 'Wallet' },
  settings: { icon: Settings, label: 'Settings' },
  menu: { icon: AlignJustify, label: 'Menu' },

  // Theme
  sun: { icon: SunIcon, label: 'Light Mode' },
  moon: { icon: MoonIcon, label: 'Dark Mode' },
  'theme-toggle': { icon: SunIcon, label: 'Theme Toggle' },

  // Financial
  transfer: { icon: ArrowLeftRight, label: 'Transfer' },
  withdraw: { icon: ArrowUpIcon, label: 'Withdraw' },
  deposit: { icon: ArrowDownIcon, label: 'Deposit' },
  'add-funds': { icon: PlusCircle, label: 'Add Funds' },
  currency: { icon: DollarSign, label: 'Currency' },
  payment: { icon: DollarSign, label: 'Payment' },

  // Market
  'trending-up': { icon: TrendingUp, label: 'Trending Up' },
  'trending-down': { icon: TrendingDown, label: 'Trending Down' },
  chart: { icon: LineChart, label: 'Chart' },
  'chart-bar': { icon: BarChart3, label: 'Bar Chart' },

  // Notifications
  alert: { icon: AlertCircle, label: 'Alert' },
  notification: { icon: Bell, label: 'Notification' },
  message: { icon: MessageCircle, label: 'Message' },
  news: { icon: Newspaper, label: 'News' },

  // Security
  shield: { icon: ShieldCheck, label: 'Security' },
  verified: { icon: CheckCircle, label: 'Verified' },
  lock: { icon: Lock, label: 'Lock' },

  // Support
  support: { icon: Headphones, label: 'Support' },
  community: { icon: Users, label: 'Community' },
  help: { icon: HelpCircle, label: 'Help' },
  ticket: { icon: List, label: 'Ticket' },

  // User
  profile: { icon: User, label: 'Profile' },
  logout: { icon: LogOutIcon, label: 'Logout' },

  // Utility
  search: { icon: Search, label: 'Search' },
  expand: { icon: ChevronDown, label: 'Expand' },
  collapse: { icon: ChevronUp, label: 'Collapse' },
  loading: { icon: Loader, label: 'Loading' },
  refresh: { icon: RefreshCw, label: 'Refresh' },
  warning: { icon: AlertTriangle, label: 'Warning' },
  save: { icon: Save, label: 'Save' },
  calendar: { icon: Calendar, label: 'Calendar' },
  strategies: { icon: Compass, label: 'Strategies' },
  orders: { icon: List, label: 'Orders' },
  lightning: { icon: Zap, label: 'Lightning' },
  premium: { icon: Star, label: 'Premium' },
  navigation: { icon: ArrowRightIcon, label: 'Navigation' },
  time: { icon: Clock, label: 'Time' },
};

/**
 * Default icon configuration for PrimeVest
 */
export const DEFAULT_ICON_SIZE = 20; // Standard size for outline icons
export const DEFAULT_ICON_COLOR_CLASS = 'text-slate-700'; // Default text color

/**
 * Icon size variants (in pixels)
 * Use these for consistent sizing across the app
 */
export const ICON_SIZES = {
  xs: 14,      // Small badges/indicators
  sm: 16,      // Compact UI elements
  md: 18,      // Standard (default)
  lg: 20,      // Large buttons/navigation
  xl: 24,      // Extra large headers
  xxl: 32,     // Hero icons
} as const;

/**
 * Icon color variants for common states
 */
export const ICON_COLOR_VARIANTS = {
  default: 'text-slate-700',
  primary: 'text-emerald-600',
  success: 'text-emerald-500',
  warning: 'text-amber-500',
  error: 'text-rose-500',
  secondary: 'text-slate-500',
  muted: 'text-slate-400',
  white: 'text-white',
  inverse: 'text-slate-900',
} as const;

/**
 * Helper to get icon by action type
 * @param action - IconAction type
 * @returns Icon component
 */
export function getIcon(action: IconAction): React.ComponentType<any> {
  return ICON_CONFIG[action]?.icon || AlertCircle;
}

/**
 * Helper to get icon label by action type
 * @param action - IconAction type
 * @returns Human-readable label
 */
export function getIconLabel(action: IconAction): string {
  return ICON_CONFIG[action]?.label || 'Icon';
}

/**
 * Type-safe icon configuration with styling
 */
export interface IconConfig {
  action: IconAction;
  size?: keyof typeof ICON_SIZES;
  color?: keyof typeof ICON_COLOR_VARIANTS;
  animated?: boolean;
  className?: string;
}

/**
 * Resolve icon config to final props
 */
export function resolveIconConfig(config: IconConfig) {
  const size = config.size ? ICON_SIZES[config.size] : DEFAULT_ICON_SIZE;
  const color = config.color ? ICON_COLOR_VARIANTS[config.color] : DEFAULT_ICON_COLOR_CLASS;
  const Icon = getIcon(config.action);

  return {
    IconComponent: Icon,
    size,
    className: config.className || color,
    animated: config.animated || false,
  };
}
