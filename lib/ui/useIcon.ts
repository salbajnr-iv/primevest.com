/**
 * useIcon Hook - Centralized icon usage with configuration
 * Provides type-safe access to icons with consistent sizing and styling
 */

'use client';

import type { IconConfig } from './icon-config';
import { resolveIconConfig, ICON_SIZES, DEFAULT_ICON_SIZE } from './icon-config';
import type React from 'react';

/**
 * Hook to get properly configured icon component with props
 * 
 * @example
 * const { IconComponent, props } = useIcon({ 
 *   action: 'deposit',
 *   size: 'lg',
 *   color: 'primary'
 * });
 * 
 * return <IconComponent {...props} />;
 */
export function useIcon(config: IconConfig) {
  const resolved = resolveIconConfig(config);

  const IconComponent = resolved.IconComponent;
  
  const props = {
    size: resolved.size,
    strokeWidth: 2, // Consistent stroke width for outline style
    className: resolved.className,
    ...(resolved.animated && { className: `${resolved.className} animate-spin` }),
  };

  return { IconComponent, props };
}

/**
 * Hook to get icon sizing value
 * Useful for dynamic sizing calculations
 * 
 * @example
 * const iconSize = useIconSize('lg'); // returns 20
 */
export function useIconSize(size: keyof typeof ICON_SIZES = 'md'): number {
  return ICON_SIZES[size];
}

/**
 * Utility for consistent icon sizing across the app
 * Returns Tailwind-safe pixel values
 */
export const ICON_PIXEL_VALUES = {
  xs: 'h-3.5 w-3.5', // 14px
  sm: 'h-4 w-4', // 16px
  md: 'h-[18px] w-[18px]', // 18px (standard)
  lg: 'h-5 w-5', // 20px
  xl: 'h-6 w-6', // 24px
  xxl: 'h-8 w-8', // 32px
} as const;

