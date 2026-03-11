"use client";

import * as React from "react";

// Breakpoint definitions matching CSS breakpoints
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

// Type for window size state
export interface WindowSize {
  width: number;
  height: number;
}

// Type for responsive flags
export interface ResponsiveFlags {
  isMobile: boolean;
  isTablet: boolean;
  isLaptop: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  isReady: boolean;
  breakpoint: BreakpointKey;
  breakpoints: typeof BREAKPOINTS;
}

// Helper function to determine current breakpoint
function getBreakpoint(width: number): BreakpointKey {
  if (width >= BREAKPOINTS.xxl) return 'xxl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  return 'sm';
}

export function useWindowSize() {
  const [windowSize, setWindowSize] = React.useState<WindowSize>({
    width: 0,
    height: 0,
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({
        width,
        height,
      });
      
      // Update CSS custom properties for consistent responsive detection
      document.documentElement.style.setProperty('--viewport-width', `${width}px`);
      document.documentElement.style.setProperty('--viewport-height', `${height}px`);
      
      // Update data attribute for CSS-based detection
      const breakpoint = getBreakpoint(width);
      document.documentElement.setAttribute('data-breakpoint', breakpoint);
      document.documentElement.setAttribute('data-viewport', `${width}x${height}`);
    };

    // Initialize
    handleResize();
    
    // Add listeners
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  // Calculate responsive flags based on current window size
  const isReady = windowSize.width > 0;
  
  // Match CSS breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), xxl (1536px)
  const isMobile = isReady && windowSize.width < BREAKPOINTS.md; // < 768px
  const isTablet = isReady && windowSize.width >= BREAKPOINTS.md && windowSize.width < BREAKPOINTS.lg; // 768px - 1023px
  const isLaptop = isReady && windowSize.width >= BREAKPOINTS.lg && windowSize.width < BREAKPOINTS.xl; // 1024px - 1279px
  const isDesktop = isReady && windowSize.width >= BREAKPOINTS.lg; // >= 1024px
  const isLargeDesktop = isReady && windowSize.width >= BREAKPOINTS.xl; // >= 1280px
  
  // Orientation detection
  const isPortrait = isReady && windowSize.height > windowSize.width;
  const isLandscape = isReady && windowSize.width > windowSize.height;
  
  // Current breakpoint
  const breakpoint = isReady ? getBreakpoint(windowSize.width) : 'sm';

  return {
    ...windowSize,
    isMobile,
    isTablet,
    isLaptop,
    isDesktop,
    isLargeDesktop,
    isPortrait,
    isLandscape,
    isReady,
    breakpoint,
    breakpoints: BREAKPOINTS,
  };
}

// Utility hook for checking specific breakpoint
export function useBreakpoint(breakpoint: BreakpointKey) {
  const { width } = useWindowSize();
  return width >= BREAKPOINTS[breakpoint];
}

// Hook for detecting when screen size changes to a specific range
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

