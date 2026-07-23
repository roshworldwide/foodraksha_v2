"use client";

import { useActionState } from "react";
import { Button, Card, Field, Input } from "@/components/ui";
import { changePassword, type PasswordState } from "./actions";

export function ChangePassword() {
  const [state, action, pending] = useActionState<PasswordState, FormData>(
    changePassword,
    {},
  );

  return (
    <Card>
      <h2 className="text-title-3">Change password</h2>
      <p className="mt-1.5 mb-5 text-body text-label-2">
        Changing your password signs you out everywhere else.
      </p>

      {state.ok ? (
        <p
          role="status"
          className="rounded-list border-l-[3px] border-ok bg-ok-bg px-4 py-3 text-body text-label"
        >
          Password changed. You are still signed in on this device.
        </p>
      ) : (
        <form action={action}>
          {/* Present so browsers and password managers attach it to the
              right account; never displayed prefilled. */}
          <Field htmlFor="current" label="Current password">
            <Input
              id="current"
              name="current"
              type="password"
              autoComplete="current-password"
            />
          </Field>
          <Field
            htmlFor="next"
            label="New password"
            hint="At least 8 characters."
          >
            <Input
              id="next"
              name="next"
              type="password"
              autoComplete="new-password"
              aria-describedby="next-hint"
            />
          </Field>
          <Field
            htmlFor="confirm"
            label="Confirm new password"
            error={state.error}
          >
            <Input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
            />
          </Field>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Update password"}
          </Button>
        </form>
      )}
    </Card>
  );
}
