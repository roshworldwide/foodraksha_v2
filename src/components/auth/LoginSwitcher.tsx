"use client";

import { useState } from "react";
import Link from "next/link";
import { LoginForm, type IdentifierField } from "@/components/auth/LoginForm";
import { LoginLockup } from "@/components/auth/LoginLockup";
import { cn } from "@/lib/cn";
import { loginCustomer, loginStaff, type LoginState } from "@/lib/auth/actions";

type Role = "customer" | "staff";

interface RoleConfig {
  title: string;
  subtitle: string;
  identifier: IdentifierField;
  action: (state: LoginState, formData: FormData) => Promise<LoginState>;
  footer: React.ReactNode;
}

const CONFIG: Record<Role, RoleConfig> = {
  customer: {
    title: "Welcome back",
    subtitle: "Track your FSSAI licence application",
    identifier: {
      name: "identifier",
      label: "Email",
      hint: "The email you registered with.",
      type: "email",
      inputMode: "email",
      autoComplete: "username",
      placeholder: "you@example.com",
    },
    action: loginCustomer,
    footer: (
      <>
        Don&rsquo;t have an account yet? Your FoodRaksha agent sets it up for
        you and sends your sign-in details.
      </>
    ),
  },
  staff: {
    title: "CRM Workspace",
    subtitle: "for the FoodRaksha team",
    identifier: {
      name: "identifier",
      label: "Work email",
      hint: "Your FoodRaksha email. Your mobile number works too.",
      type: "text",
      inputMode: "email",
      autoComplete: "username",
      placeholder: "you@foodraksha.in",
    },
    action: loginStaff,
    footer: (
      <>
        Team accounts are created by an administrator. Trouble signing in?{" "}
        <a
          href="mailto:support@foodraksha.in"
          className="font-semibold text-label underline"
        >
          Ask support
        </a>
        .
      </>
    ),
  },
};

/**
 * One sign-in page for both portals. A segmented control switches between the
 * customer and staff sign-in — the copy, the identifier field and the server
 * action all change with it, so a single URL serves everyone.
 */
export function LoginSwitcher({
  initialRole,
  nextPath,
  children,
}: {
  initialRole: Role;
  nextPath?: string;
  /** Optional notice (e.g. "account deleted") shown above the form. */
  children?: React.ReactNode;
}) {
  const [role, setRole] = useState<Role>(initialRole);
  const config = CONFIG[role];

  return (
    <LoginLockup
      title={config.title}
      subtitle={config.subtitle}
      toggle={<RoleToggle role={role} onChange={setRole} />}
      footer={
        <>
          {config.footer}
          <span className="mt-3 block">
            {role === "customer" ? (
              <>
                Something else?{" "}
                <Link href="/" className="font-semibold text-label underline">
                  Back to home
                </Link>
              </>
            ) : (
              <>
                Not a team member?{" "}
                <button
                  type="button"
                  onClick={() => setRole("customer")}
                  className="cursor-pointer font-semibold text-label underline"
                >
                  FR-Member sign-in
                </button>
              </>
            )}
          </span>
        </>
      }
    >
      {children}
      {/* Remounting on role change resets any error and the field value. */}
      <LoginForm
        key={role}
        action={config.action}
        submitLabel="Sign in"
        nextPath={nextPath}
        identifier={config.identifier}
      />
    </LoginLockup>
  );
}

function RoleToggle({
  role,
  onChange,
}: {
  role: Role;
  onChange: (role: Role) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Who is signing in"
      className="inline-flex rounded-pill bg-quiet p-1"
    >
      {(["customer", "staff"] as const).map((value) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={role === value}
          onClick={() => onChange(value)}
          className={cn(
            "cursor-pointer rounded-pill px-5 py-2 text-footnote font-semibold transition-colors",
            role === value
              ? "bg-graphite text-white shadow-1"
              : "text-label-2 hover:text-label",
          )}
        >
          {value === "customer" ? "I'm an FR-Member" : "I'm staff"}
        </button>
      ))}
    </div>
  );
}
