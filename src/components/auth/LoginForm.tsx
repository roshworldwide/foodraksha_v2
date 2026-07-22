"use client";

import { useActionState } from "react";
import { Button, Field, Input } from "@/components/ui";
import type { LoginState } from "@/lib/auth/actions";

export interface LoginFormProps {
  action: (state: LoginState, formData: FormData) => Promise<LoginState>;
  submitLabel: string;
  /** Path the visitor was trying to reach before being sent here. */
  nextPath?: string;
}

export function LoginForm({ action, submitLabel, nextPath }: LoginFormProps) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    action,
    {},
  );

  return (
    <form action={formAction} noValidate>
      {nextPath && <input type="hidden" name="next" value={nextPath} />}
      <Field
        htmlFor="mobile"
        label="Mobile number"
        hint="The number you registered with, 10 digits."
      >
        <Input
          id="mobile"
          name="mobile"
          type="tel"
          inputMode="numeric"
          autoComplete="username"
          placeholder="98450 21764"
          aria-describedby="mobile-hint"
          required
        />
      </Field>

      <Field htmlFor="password" label="Password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>

      {state.error && (
        <p
          role="alert"
          className="mb-[18px] rounded-input bg-stop-bg px-4 py-3 text-footnote font-medium text-stop"
        >
          {state.error}
        </p>
      )}

      <Button type="submit" fullWidth disabled={pending}>
        {pending ? "Signing in…" : submitLabel}
      </Button>
    </form>
  );
}
