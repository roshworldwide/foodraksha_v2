"use client";

import { useEffect } from "react";

/**
 * The last-resort boundary — catches errors in the root layout itself, so it
 * must render its own <html>/<body>. Deliberately dependency-free and inline,
 * since whatever failed may be the styling or the layout.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error.digest ?? error.message);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          background: "#efede8",
          color: "#1d1d1f",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          margin: 0,
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            Something went wrong
          </h1>
          <p style={{ color: "rgba(60,60,67,.6)", marginBottom: 20 }}>
            The page didn&rsquo;t load. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              minHeight: 50,
              padding: "0 26px",
              borderRadius: 980,
              border: 0,
              background: "#1d1d1f",
              color: "#fff",
              fontSize: 17,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
