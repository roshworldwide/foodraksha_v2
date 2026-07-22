"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui";
import { submitApplication, type SubmitState } from "./actions";

export function ReviewSubmit({ blocked }: { blocked: boolean }) {
  // The action is passed straight through, never wrapped in a closure —
  // that is what lets React submit this form without JavaScript.
  const [state, formAction, pending] = useActionState<SubmitState, FormData>(
    submitApplication,
    {},
  );

  return (
    <form action={formAction}>
      {state.error && (
        <p
          role="alert"
          className="mb-4 rounded-input bg-stop-bg px-4 py-3 text-footnote font-medium text-stop"
        >
          {state.error}
        </p>
      )}

      <Button type="submit" fullWidth disabled={pending || blocked}>
        {pending ? "Submitting…" : "Submit application"}
      </Button>

      <p className="mt-3.5 text-center text-footnote text-label-2">
        Your FoodRaksha agent takes it from here. You can still be asked for
        clarifications, and you will be told the moment anything changes.
      </p>
    </form>
  );
}
