# Task Plan: Dashboard Bottom Navbar Pages Implementation

## Task Summary
Create referenced pages in the dashboard bottom navbar and ensure Home stays within the dashboard.

## Files to Create/Modify

### 1. Modify BottomNav.tsx
- Change Home href from "/" to "/dashboard" to keep navigation within dashboard

### 2. Create app/dashboard/trade/page.tsx
- New Trade page for dashboard navigation
- Consistent UI pattern with other dashboard pages
- Include BottomNav component

### 3. Create app/markets/page.tsx  
- New Markets page referenced in bottom navbar
- Consistent UI pattern with other dashboard pages
- Include BottomNav component

## Implementation Steps

### Step 1: Update BottomNav.tsx
- Change Home href from "/" to "/dashboard"
- Update active path condition for Home item

### Step 2: Create Trade Page
- Create app/dashboard/trade directory
- Create page.tsx with trade interface
- Include header, trade form, and recent trades
- Use consistent UI patterns from other dashboard pages
- Include BottomNav component

### Step 3: Create Markets Page
- Create app/markets directory  
- Create page.tsx with market overview
- Display cryptocurrency listings
- Use consistent UI patterns
- Include BottomNav component

## UI Pattern Requirements
- Use DashboardHeader component
- Use BottomNav component
- Consistent header style with back button
- Mobile-responsive layout
- Loading state for hydration
- Sidebar integration

## Dependencies
- Already existing: BottomNav, DashboardHeader, Sidebar components
- Already existing: useAuth, useTheme hooks

