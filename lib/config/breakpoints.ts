export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

export const BREAKPOINT_CSS_CUSTOM_PROPERTIES = {
  sm: "--bp-sm",
  md: "--bp-md",
  lg: "--bp-lg",
  xl: "--bp-xl",
  xxl: "--bp-xxl",
} as const;
