import type { ReactNode } from "react";

/**
 * Unauthenticated shell for the sign-in screens. The pages own their own
 * full-screen layout (a two-panel split on desktop), so this just sets the
 * ground.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-bg">{children}</div>;
}
