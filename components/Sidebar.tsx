"use client";

import * as React from "react";
import { useWindowSize } from "@/hooks/useWindowSize";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { SidebarContent } from "./SidebarContent";
import { SidebarErrorBoundary, SidebarLoading } from "./SidebarErrorBoundary";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { isMobile, isReady } = useWindowSize();
  const focusTrapRef = useFocusTrap(isOpen && isMobile);
  const [isLoading, setIsLoading] = React.useState(true);

  // Handle click outside to close (mobile only)
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (focusTrapRef.current && !focusTrapRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen && isMobile) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent body scroll when sidebar is open on mobile
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, isMobile, focusTrapRef]);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Simulate loading state
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Don't render on mobile if closed
  if (!isOpen && isMobile) {
    return null;
  }

  // Show loading state
  if (isLoading || !isReady) {
    return <SidebarLoading isMobile={isMobile} />;
  }

  // Desktop sidebar - always rendered
  if (!isMobile) {
    return (
      <SidebarErrorBoundary>
        <SidebarContent onClose={onClose} isMobile={false} />
      </SidebarErrorBoundary>
    );
  }

  // Mobile slide-in sidebar
  return (
    <>
      {/* Backdrop Overlay */}
      <div 
        className="sidebar-overlay" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile Sidebar with focus trap */}
      <div ref={focusTrapRef}>
        <SidebarErrorBoundary>
          <SidebarContent onClose={onClose} isMobile={true} />
        </SidebarErrorBoundary>
      </div>
    </>
  );
}

