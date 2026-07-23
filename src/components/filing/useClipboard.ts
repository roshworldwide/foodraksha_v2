"use client";

import { useCallback, useState } from "react";

/**
 * Copy to the clipboard with a fallback for browsers or contexts where the
 * async Clipboard API is unavailable. Returns whether the copy succeeded so
 * the caller can show the right confirmation.
 */
export function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(
      () => true,
      () => legacyCopy(text),
    );
  }
  return Promise.resolve(legacyCopy(text));
}

function legacyCopy(text: string): boolean {
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "absolute";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

/**
 * A short-lived "copied" flash keyed by field id — one confirmation at a time,
 * cleared after a moment.
 */
export function useCopyFlash(resetMs = 1400) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const flash = useCallback(
    (id: string) => {
      setCopiedId(id);
      window.setTimeout(() => {
        setCopiedId((current) => (current === id ? null : current));
      }, resetMs);
    },
    [resetMs],
  );

  return { copiedId, flash };
}
