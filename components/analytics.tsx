"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
const events = new Set([
  "homepage_view",
  "course_view",
  "registration_started",
  "registration_completed",
  "contact_submitted",
]);
/** Deliberately local, no cookies/network. Connect an aggregate-only adapter later. */
export function Analytics() {
  const path = usePathname();
  useEffect(() => {
    const event =
      path === "/"
        ? "homepage_view"
        : path.startsWith("/courses/")
          ? "course_view"
          : null;
    if (event)
      window.dispatchEvent(
        new CustomEvent("academy:analytics", { detail: { event } }),
      );
    const seen = new Set<string>();
    const listener = (e: Event) => {
      const value = (e as CustomEvent<{ event: string }>).detail?.event;
      if (events.has(value) && !seen.has(value)) {
        seen.add(
          value,
        ); /* Optional privacy-reviewed adapter receives event name only. */
      }
    };
    window.addEventListener("academy:analytics", listener);
    return () => window.removeEventListener("academy:analytics", listener);
  }, [path]);
  return null;
}
