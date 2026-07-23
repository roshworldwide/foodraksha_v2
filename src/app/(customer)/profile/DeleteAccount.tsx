"use client";

import { useActionState } from "react";
import { Button, Field, Input } from "@/components/ui";
import { deleteMyAccount, type DeleteState } from "./actions";

export function DeleteAccount() {
  const [state, action, pending] = useActionState<DeleteState, FormData>(
    deleteMyAccount,
    {},
  );

  return (
    <form action={action}>
      <Field
        htmlFor="confirm"
        label="Type DELETE to confirm"
        error={state.error}
        hint="This erases your account, application and documents. It cannot be undone."
      >
        <Input
          id="confirm"
          name="confirm"
          autoComplete="off"
          placeholder="DELETE"
          aria-describedby="confirm-hint"
        />
      </Field>
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Deleting…" : "Delete my account"}
      </Button>
    </form>
  );
}
