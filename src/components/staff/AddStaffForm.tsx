"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Field, Input, Select } from "@/components/ui";

interface Created {
  name: string;
  email: string;
  mobile: string;
  role: "STAFF" | "ADMIN";
  password: string;
}

/**
 * Admin-only: create a staff login. The generated password is shown exactly
 * once, here, for the admin to hand over — it is never sent anywhere and
 * cannot be recovered, only reset.
 */
export function AddStaffForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [created, setCreated] = useState<Created | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setError(null);
    setFieldErrors({});
    try {
      const response = await fetch("/api/staff/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          mobile: data.get("mobile"),
          role: data.get("role"),
        }),
      });
      const body = (await response.json().catch(() => ({}))) as Partial<
        Created & { error: string; fieldErrors: Record<string, string> }
      >;
      if (!response.ok || !body.password || !body.email || !body.mobile) {
        setError(body.error ?? "That account could not be created.");
        setFieldErrors(body.fieldErrors ?? {});
        return;
      }
      setCreated({
        name: body.name ?? "",
        email: body.email,
        mobile: body.mobile,
        role: body.role ?? "STAFF",
        password: body.password,
      });
      form.reset();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (created) {
    return (
      <Card>
        <h2 className="text-title-3">Login created for {created.name}</h2>
        <p className="mt-1.5 text-body text-label-2">
          Share these now. The password is shown only once — if it is lost,
          reset it from the list below.
        </p>
        <dl className="mt-4 space-y-1.5 text-[15px]">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-label-2">Work email</dt>
            <dd className="font-mono">{created.email}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-label-2">Mobile (also works)</dt>
            <dd className="font-mono">{created.mobile}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-label-2">Password</dt>
            <dd className="font-mono">{created.password}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-label-2">Role</dt>
            <dd>{created.role === "ADMIN" ? "Administrator" : "Staff"}</dd>
          </div>
        </dl>
        <p className="mt-3 text-footnote text-label-2">
          They sign in at /login → &ldquo;I&rsquo;m staff&rdquo;.
        </p>
        <div className="mt-4">
          <Button size="sm" variant="secondary" onClick={() => setCreated(null)}>
            Add another
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-title-3">Add a staff member</h2>
      <p className="mt-1.5 mb-4 text-body text-label-2">
        Creates a login for the CRM. You will be shown their password once to
        pass on.
      </p>
      <form onSubmit={submit} noValidate>
        <Field htmlFor="staff-name" label="Full name" error={fieldErrors.name}>
          <Input
            id="staff-name"
            name="name"
            autoComplete="off"
            required
            disabled={busy}
          />
        </Field>
        <Field
          htmlFor="staff-email"
          label="Work email"
          hint="How they sign in day to day."
          error={fieldErrors.email}
        >
          <Input
            id="staff-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="off"
            required
            disabled={busy}
          />
        </Field>
        <Field
          htmlFor="staff-mobile"
          label="Mobile number"
          hint="10-digit Indian number. Also works as their username."
          error={fieldErrors.mobile}
        >
          <Input
            id="staff-mobile"
            name="mobile"
            type="tel"
            inputMode="tel"
            autoComplete="off"
            required
            disabled={busy}
          />
        </Field>
        <Field
          htmlFor="staff-role"
          label="Role"
          hint="Administrators can also manage the team here."
          error={fieldErrors.role}
        >
          <Select id="staff-role" name="role" defaultValue="STAFF" disabled={busy}>
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Administrator</option>
          </Select>
        </Field>

        {error && (
          <p
            role="alert"
            className="mb-[18px] rounded-input bg-stop-bg px-4 py-3 text-footnote font-medium text-stop"
          >
            {error}
          </p>
        )}

        <Button type="submit" disabled={busy}>
          {busy ? "Creating…" : "Create login"}
        </Button>
      </form>
    </Card>
  );
}
