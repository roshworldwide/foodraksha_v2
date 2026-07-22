import type { ReactNode } from "react";

/** Centred, unauthenticated shell for the two login screens. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-14">
      <div className="w-full max-w-[420px]">{children}</div>
    </div>
  );
}
