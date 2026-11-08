"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Privacy: a random id in this browser's localStorage and the page path. No cookies, no IP
// address, no fingerprinting. Open any page with ?notrack=1 to stop counting this browser
// (use it on your own devices); ?notrack=0 turns counting back on.
const VISITOR = "amxinz_vid";
const FIRST_TOUCH = "amxinz_src";
const CLAIMED = "amxinz_src_claimed";
const VISIT = "amxinz_visit";
const NOTRACK = "amxinz_notrack";

function visitorId(): string {
  let id = localStorage.getItem(VISITOR);
  if (!id) {
    id = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(VISITOR, id);
  }
  return id;
}

function send(url: string, payload: unknown) {
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon?.(url, new Blob([body], { type: "application/json" }))) return;
  fetch(url, { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => undefined);
}

export function Analytics({ loggedIn }: { loggedIn: boolean }) {
  const pathname = usePathname();

  useEffect(() => {
    try {
      const flag = new URLSearchParams(window.location.search).get("notrack");
      if (flag === "1") localStorage.setItem(NOTRACK, "1");
      if (flag === "0") localStorage.removeItem(NOTRACK);
    } catch {
      /* storage blocked: nothing to do */
    }
  }, []);

  // One page-view per route, and one "landing" per browser-tab visit.
  useEffect(() => {
    try {
      if (localStorage.getItem(NOTRACK) || /^\/(admin|api)(\/|$)/.test(pathname)) return;

      const params = new URLSearchParams(window.location.search);
      const landing = !sessionStorage.getItem(VISIT);
      sessionStorage.setItem(VISIT, "1");

      const ref = landing ? (params.get("ref") ?? params.get("utm_source")) : null;
      const referrer = landing ? document.referrer : "";

      // Remember the very first source so it can be credited when this person signs up.
      if (landing && !localStorage.getItem(FIRST_TOUCH)) {
        localStorage.setItem(FIRST_TOUCH, JSON.stringify({ ref, referrer, path: pathname }));
      }

      send("/api/track", { path: pathname, visitorId: visitorId(), landing, ref, referrer });
    } catch {
      /* tracking is best effort */
    }
  }, [pathname]);

  // Right after signing up, tell the server where this person originally came from (once).
  useEffect(() => {
    if (!loggedIn) return;
    try {
      if (localStorage.getItem(CLAIMED)) return;
      const first = JSON.parse(localStorage.getItem(FIRST_TOUCH) ?? "{}");
      localStorage.setItem(CLAIMED, "1");
      send("/api/track/attribute", { ref: first.ref ?? null, referrer: first.referrer ?? "", path: first.path ?? null });
    } catch {
      /* best effort */
    }
  }, [loggedIn]);

  return null;
}
