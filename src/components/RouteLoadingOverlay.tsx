import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { BluebirdLoader } from "./BluebirdLoader";

/**
 * Centered overlay that appears whenever the router is navigating or
 * transitioning. Replaces the old top progress bar with the branded
 * Bluebird loader animation in the middle of the viewport.
 *
 * Shows after a short delay so instant client routes don't flash it.
 */
export function RouteLoadingOverlay() {
  const isLoading = useRouterState({
    select: (s) => s.isLoading || s.isTransitioning,
  });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setVisible(false);
      return;
    }
    const t = window.setTimeout(() => setVisible(true), 180);
    return () => window.clearTimeout(t);
  }, [isLoading]);

  if (!visible) return null;
  return <BluebirdLoader variant="page" label="Loading…" />;
}
