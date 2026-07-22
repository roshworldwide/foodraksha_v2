"use client";

import { useState } from "react";
import {
  Button,
  Card,
  List,
  ListGroup,
  ListGroupHeader,
  ListIcon,
  ListRow,
  Progress,
  SlideOver,
  StatusPill,
} from "@/components/ui";

/** Mirrors the staff slide-over in docs/prototype.html. */
export function SlideOverDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open slide-over
      </Button>

      <SlideOver
        open={open}
        onClose={() => setOpen(false)}
        title="Meera Raghavan"
        subtitle="Spice Route Kitchen · Restaurant"
        meta={
          <>
            <StatusPill tone="wait">Query Raised</StatusPill>
            <StatusPill tone="idle">Application FR-2417</StatusPill>
          </>
        }
        footer={
          <>
            <Button variant="quiet" className="flex-1">
              Raise Query
            </Button>
            <Button variant="primary" className="flex-[1.4]">
              Generate PDFs
            </Button>
          </>
        }
      >
        <ListGroup>
          <ListGroupHeader>Progress</ListGroupHeader>
          <Card>
            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-subhead text-label-2">
                Sections complete
              </span>
              <span className="text-title-3">64%</span>
            </div>
            <Progress value={64} label="Sections complete" />
          </Card>
        </ListGroup>

        <ListGroup>
          <ListGroupHeader>Contact</ListGroupHeader>
          <List>
            <ListRow compact subtitle="Mobile" title="+91 98450 21764" />
            <ListRow compact subtitle="Email" title="meera@spiceroute.in" />
            <ListRow compact subtitle="Location" title="Bengaluru, Karnataka" />
            <ListRow compact subtitle="Licence type" title="State Licence" />
          </List>
        </ListGroup>

        <ListGroup>
          <ListGroupHeader>Sections — tap to view or edit</ListGroupHeader>
          <List>
            <ListRow
              compact
              chevron
              onClick={() => {}}
              icon={<ListIcon tone="done">✓</ListIcon>}
              title="Business Details"
            />
            <ListRow
              compact
              chevron
              onClick={() => {}}
              icon={<ListIcon tone="done">✓</ListIcon>}
              title="Applicant Details"
            />
            <ListRow
              compact
              chevron
              onClick={() => {}}
              icon={<ListIcon tone="current">4</ListIcon>}
              title="Food Categories"
              subtitle="Partially complete"
            />
            <ListRow
              compact
              chevron
              onClick={() => {}}
              icon={<ListIcon tone="pending">5</ListIcon>}
              title="Equipment & Capacity"
              subtitle="Not started"
            />
          </List>
        </ListGroup>

        <ListGroup className="mb-0">
          <ListGroupHeader>Documents</ListGroupHeader>
          <List>
            <ListRow
              compact
              icon={<ListIcon tone="done">✓</ListIcon>}
              title="Aadhaar Card"
              subtitle="Approved"
            />
            <ListRow
              compact
              icon={<ListIcon tone="wait">!</ListIcon>}
              title="Water Test Report"
              subtitle="Unreadable — re-upload requested"
            />
            <ListRow
              compact
              icon={<ListIcon tone="pending">·</ListIcon>}
              title="Layout Plan"
              subtitle="Awaiting upload"
            />
          </List>
        </ListGroup>
      </SlideOver>
    </>
  );
}
