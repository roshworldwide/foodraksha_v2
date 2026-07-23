import type { Instrumentation } from "next";
import { reportError } from "@/lib/log";

/**
 * Server-side request instrumentation. Every unhandled error in a route, page
 * or server action arrives here as structured output, tagged with where it
 * came from — the single place to forward errors to Sentry or an equivalent.
 */
export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context,
) => {
  reportError(error, {
    path: request.path,
    method: request.method,
    route: context.routePath,
    routeType: context.routeType,
  });
};
