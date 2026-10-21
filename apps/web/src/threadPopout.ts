import { THREAD_POPOUT_WINDOW_NAME_PREFIX, type ScopedThreadRef } from "@t3tools/contracts";
import type { AnyRouter } from "@tanstack/react-router";

import { buildThreadRouteParams } from "./threadRoutes";

/**
 * True when this window was opened by "Pop out thread". A pop-out shows one
 * thread without the sidebar and the per-app coordinators that the main
 * window already runs. `window.name` survives navigation and reload, so the
 * window stays a pop-out for its whole life.
 */
export const isThreadPopoutWindow =
  typeof window !== "undefined" && window.name.startsWith(THREAD_POPOUT_WINDOW_NAME_PREFIX);

/** One window per thread: reopening a thread targets its existing pop-out instead of adding one. */
function threadPopoutWindowName(ref: ScopedThreadRef): string {
  return `${THREAD_POPOUT_WINDOW_NAME_PREFIX}${ref.environmentId}:${ref.threadId}`;
}

const THREAD_POPOUT_WINDOW_FEATURES = "popup,width=960,height=760";

/** Resolves the thread's app URL through the router's history, so hash and path histories both work. */
function buildThreadPopoutHref(router: AnyRouter, ref: ScopedThreadRef): string {
  const location = router.buildLocation({
    to: "/$environmentId/$threadId",
    params: buildThreadRouteParams(ref),
  });
  return new URL(router.history.createHref(location.href), window.location.href).href;
}

export function openThreadPopout(router: AnyRouter, ref: ScopedThreadRef): void {
  const popout = window.open(
    buildThreadPopoutHref(router, ref),
    threadPopoutWindowName(ref),
    THREAD_POPOUT_WINDOW_FEATURES,
  );
  // A browser returns the existing window for a reused name; the desktop app
  // reveals it from the main process and returns null here.
  popout?.focus();
}
