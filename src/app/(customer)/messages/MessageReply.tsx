"use client";

import { useActionState } from "react";
import { Button, Textarea } from "@/components/ui";
import { respondToQuery, type RespondState } from "./actions";

/**
 * The reply box under an open query. Sending it resolves the query and, when
 * it is the last one, returns the application to review.
 */
export function MessageReply({ queryId }: { queryId: string }) {
  const [state, action, pending] = useActionState<RespondState, FormData>(
    respondToQuery,
    {},
  );

  return (
    <form action={action} className="mt-3.5">
      <input type="hidden" name="queryId" value={queryId} />
      <Textarea
        name="message"
        rows={3}
        placeholder="Type your reply, or make the fix above and reply to let us know."
        aria-label="Your reply"
        required
      />
      {state.error && (
        <p role="alert" className="mt-1.5 text-footnote font-medium text-stop">
          {state.error}
        </p>
      )}
      <div className="mt-2.5">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Sending…" : "Send reply & mark resolved"}
        </Button>
      </div>
    </form>
  );
}
