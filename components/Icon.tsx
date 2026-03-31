/**
 * Icon Component - Type-safe, reusable icon renderer
 * Applies PrimeVest icon configuration for consistent outline style
 */

'use client';

import React from 'react';
import { useIcon } from '@/lib/ui/useIcon';
import type { IconConfig } from '@/lib/ui/icon-config';

interface IconProps extends Omit<IconConfig, 'className'> {
  /**
   * Additional Tailwind CSS classes to apply
   */
  className?: string;
  /**
   * Additional HTML attributes
   */
  htmlAttributes?: React.SVGAttributes<SVGSVGElement>;
}

/**
 * PrimeVest Icon Component
 * 
 * Consistent, type-safe icon usage with:
 * - Outline style (thick strokes)
 * - Standardized sizing (18-20px default)
 * - Color variants (primary, success, error, etc.)
 * - Animation support (loading state)
 * 
 * @example
 * // Basic usage
 * <Icon action="deposit" size="lg" color="primary" />
 * 
 * // With animation (loading)
 * <Icon action="loading" animated />
 * 
 * // With custom className
 * <Icon action="settings" className="hover:text-emerald-700 transition" />
 * 
 * // With accessibility
 * <Icon action="alert" aria-label="Warning" role="img" />
 */
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  (
    {
      action,
      size = 'md',
      color = 'default',
      animated = false,
      className: additionalClassName,
      htmlAttributes,
    },
    ref
  ) => {
    const { IconComponent, props } = useIcon({
      action,
      size,
      color,
      animated,
      className: additionalClassName,
    });

    // Merge classes: config classes + additional classes
    const mergedClassName = additionalClassName
      ? `${props.className} ${additionalClassName}`
      : props.className;

    return (
      <IconComponent
        ref={ref}
        {...props}
        className={mergedClassName}
        {...htmlAttributes}
      />
    );
  }
);

Icon.displayName = 'Icon';

/**
 * Action-specific icon components for common use cases
 * Provides quick access to frequently used icons with sensible defaults
 */

export const IconDashboard = ({ size = 'md', ...props }: Omit<IconProps, 'action'>) => (
  <Icon action="dashboard" size={size} {...props} />
);
IconDashboard.displayName = 'IconDashboard';

export const IconWallet = ({ size = 'md', ...props }: Omit<IconProps, 'action'>) => (
  <Icon action="wallet" size={size} {...props} />
);
IconWallet.displayName = 'IconWallet';

export const IconSettings = ({ size = 'md', ...props }: Omit<IconProps, 'action'>) => (
  <Icon action="settings" size={size} {...props} />
);
IconSettings.displayName = 'IconSettings';

export const IconDeposit = ({ size = 'md', color = 'primary', ...props }: Omit<IconProps, 'action'>) => (
  <Icon action="deposit" size={size} color={color} {...props} />
);
IconDeposit.displayName = 'IconDeposit';

export const IconWithdraw = ({ size = 'md', color = 'warning', ...props }: Omit<IconProps, 'action'>) => (
  <Icon action="withdraw" size={size} color={color} {...props} />
);
IconWithdraw.displayName = 'IconWithdraw';

export const IconTransfer = ({ size = 'md', ...props }: Omit<IconProps, 'action'>) => (
  <Icon action="transfer" size={size} {...props} />
);
IconTransfer.displayName = 'IconTransfer';

export const IconTrendingUp = ({ size = 'md', color = 'success', ...props }: Omit<IconProps, 'action'>) => (
  <Icon action="trending-up" size={size} color={color} {...props} />
);
IconTrendingUp.displayName = 'IconTrendingUp';

export const IconTrendingDown = ({ size = 'md', color = 'error', ...props }: Omit<IconProps, 'action'>) => (
  <Icon action="trending-down" size={size} color={color} {...props} />
);
IconTrendingDown.displayName = 'IconTrendingDown';

export const IconAlert = ({ size = 'md', color = 'error', ...props }: Omit<IconProps, 'action'>) => (
  <Icon action="alert" size={size} color={color} {...props} />
);
IconAlert.displayName = 'IconAlert';

export const IconNotification = ({ size = 'md', ...props }: Omit<IconProps, 'action'>) => (
  <Icon action="notification" size={size} {...props} />
);
IconNotification.displayName = 'IconNotification';

export const IconLoading = ({ size = 'md', ...props }: Omit<IconProps, 'action' | 'animated'>) => (
  <Icon action="loading" size={size} animated {...props} />
);
IconLoading.displayName = 'IconLoading';

export const IconVerified = ({ size = 'md', color = 'success', ...props }: Omit<IconProps, 'action'>) => (
  <Icon action="verified" size={size} color={color} {...props} />
);
IconVerified.displayName = 'IconVerified';

export const IconShield = ({ size = 'md', color = 'primary', ...props }: Omit<IconProps, 'action'>) => (
  <Icon action="shield" size={size} color={color} {...props} />
);
IconShield.displayName = 'IconShield';

export const IconSearch = ({ size = 'md', ...props }: Omit<IconProps, 'action'>) => (
  <Icon action="search" size={size} {...props} />
);
IconSearch.displayName = 'IconSearch';

export const IconChart = ({ size = 'md', ...props }: Omit<IconProps, 'action'>) => (
  <Icon action="chart" size={size} {...props} />
);
IconChart.displayName = 'IconChart';

export const IconUser = ({ size = 'md', ...props }: Omit<IconProps, 'action'>) => (
  <Icon action="profile" size={size} {...props} />
);
IconUser.displayName = 'IconUser';

export const IconLogout = ({ size = 'md', color = 'error', ...props }: Omit<IconProps, 'action'>) => (
  <Icon action="logout" size={size} color={color} {...props} />
);
IconLogout.displayName = 'IconLogout';
