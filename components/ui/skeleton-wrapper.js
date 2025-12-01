"use client";

import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

/**
 * A wrapper that handles the loading state.
 * If isLoading is true, it renders the Skeleton.
 * If isLoading is false, it renders the children (actual content).
 */
export default function SkeletonWrapper({
  children,
  isLoading,
  count = 1,
  className = "",
  // Default sizes can be overridden
  height,
  width,
  circle = false,
}) {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <SkeletonTheme
      // We use the CSS variables from globals.css to ensure it matches the theme
      baseColor="hsl(var(--muted))"
      highlightColor="hsl(var(--background))"
    >
      <Skeleton
        count={count}
        className={className}
        height={height}
        width={width}
        circle={circle}
      />
    </SkeletonTheme>
  );
}

// Export the raw Skeleton component too, in case we need it directly
export { Skeleton };