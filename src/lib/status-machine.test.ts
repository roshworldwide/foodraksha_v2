import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AppStatus } from "@prisma/client";
import {
  canTransition,
  milestoneForStatus,
  nextStatuses,
} from "./status-machine";

const ALL: AppStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "QUERY_RAISED",
  "READY_TO_FILE",
  "FILED",
  "FSSAI_QUERY",
  "ISSUED",
  "REJECTED",
  "CLOSED",
];

describe("status machine", () => {
  it("walks the whole happy path", () => {
    const path: AppStatus[] = [
      "DRAFT",
      "SUBMITTED",
      "UNDER_REVIEW",
      "READY_TO_FILE",
      "FILED",
      "ISSUED",
      "CLOSED",
    ];
    for (let i = 0; i < path.length - 1; i += 1) {
      assert.ok(
        canTransition(path[i], path[i + 1]),
        `${path[i]} → ${path[i + 1]} should be legal`,
      );
    }
  });

  it("allows the query round-trips both ways", () => {
    assert.ok(canTransition("UNDER_REVIEW", "QUERY_RAISED"));
    assert.ok(canTransition("QUERY_RAISED", "UNDER_REVIEW"));
    assert.ok(canTransition("FILED", "FSSAI_QUERY"));
    assert.ok(canTransition("FSSAI_QUERY", "FILED"));
  });

  it("rejects skipping a stage", () => {
    assert.ok(!canTransition("DRAFT", "UNDER_REVIEW"));
    assert.ok(!canTransition("SUBMITTED", "FILED"));
    assert.ok(!canTransition("UNDER_REVIEW", "ISSUED"));
  });

  it("never moves out of a terminal state", () => {
    assert.deepEqual(nextStatuses("REJECTED"), []);
    assert.deepEqual(nextStatuses("CLOSED"), []);
    for (const to of ALL) {
      assert.ok(!canTransition("CLOSED", to));
      assert.ok(!canTransition("REJECTED", to));
    }
  });

  it("never allows a status to transition to itself", () => {
    for (const status of ALL) {
      assert.ok(!canTransition(status, status), `${status} → ${status}`);
    }
  });

  it("keeps internal states off the customer timeline", () => {
    // READY_TO_FILE and QUERY_RAISED both read as "review" — the customer
    // never sees the internal workflow.
    assert.equal(milestoneForStatus("READY_TO_FILE"), "review");
    assert.equal(milestoneForStatus("QUERY_RAISED"), "review");
    assert.equal(milestoneForStatus("UNDER_REVIEW"), "review");
    assert.equal(milestoneForStatus("FSSAI_QUERY"), "filed");
    assert.equal(milestoneForStatus("ISSUED"), "issued");
  });
});
