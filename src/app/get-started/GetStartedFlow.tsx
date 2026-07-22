"use client";

/**
 * TEMPORARY — internal caller for POST /api/public/signup.
 *
 * The real enquiry form ships with the marketing website in phase 2 and will
 * post the same JSON to the same endpoint. When it does, delete this page.
 * Do not add signup logic here: it belongs behind the endpoint.
 */

import { useState } from "react";
import {
  Button,
  ButtonLink,
  Card,
  Field,
  Input,
  List,
  ListIcon,
  ListRow,
  Select,
  Toggle,
} from "@/components/ui";
import type { DeliveryResult } from "@/lib/notifications";

export interface CategoryOption {
  code: string;
  name: string;
}

interface SignupResponse {
  username: string;
  password: string;
  applicationNo: string;
  delivery: { sms: DeliveryResult; email: DeliveryResult };
}

interface ErrorResponse {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export function GetStartedFlow({
  categories,
}: {
  categories: CategoryOption[];
}) {
  const [account, setAccount] = useState<SignupResponse | null>(null);

  return account ? (
    <Credentials account={account} />
  ) : (
    <SignupForm categories={categories} onCreated={setAccount} />
  );
}

/* ─────────────────────────────────────────────────────────── form */

/** Where this visitor came from. Browser-only, read at submit time. */
function captureAttribution(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const captured: Record<string, string> = {};
  const utmSource = params.get("utm_source");
  const utmMedium = params.get("utm_medium");
  const utmCampaign = params.get("utm_campaign");
  if (utmSource) captured.utmSource = utmSource;
  if (utmMedium) captured.utmMedium = utmMedium;
  if (utmCampaign) captured.utmCampaign = utmCampaign;
  if (document.referrer) captured.referrer = document.referrer;
  return captured;
}

function SignupForm({
  categories,
  onCreated,
}: {
  categories: CategoryOption[];
  onCreated: (account: SignupResponse) => void;
}) {
  const [pending, setPending] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setFieldErrors({});

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      mobile: String(form.get("mobile") ?? ""),
      email: String(form.get("email") ?? ""),
      businessType: String(form.get("businessType") ?? ""),
      city: String(form.get("city") ?? ""),
      consent,
      ...captureAttribution(),
    };

    try {
      const response = await fetch("/api/public/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onCreated((await response.json()) as SignupResponse);
        return;
      }

      const body = (await response.json().catch(() => ({}))) as ErrorResponse;
      setFieldErrors(body.fieldErrors ?? {});
      setError(body.error ?? "Something went wrong. Please try again.");
    } catch {
      setError(
        "We could not reach the server. Check your connection and try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid gap-x-5 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          <Field htmlFor="name" label="Full name" error={fieldErrors.name}>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              placeholder="Rajesh Kumar"
              aria-invalid={Boolean(fieldErrors.name)}
              required
            />
          </Field>

          <Field
            htmlFor="mobile"
            label="Mobile number"
            error={fieldErrors.mobile}
            hint="This becomes your username."
          >
            <Input
              id="mobile"
              name="mobile"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="98765 43210"
              aria-invalid={Boolean(fieldErrors.mobile)}
              aria-describedby="mobile-hint"
              required
            />
          </Field>

          <Field
            htmlFor="email"
            label="Email address"
            error={fieldErrors.email}
          >
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@business.com"
              aria-invalid={Boolean(fieldErrors.email)}
              required
            />
          </Field>

          <Field
            htmlFor="businessType"
            label="Business type"
            error={fieldErrors.businessType}
          >
            <Select
              id="businessType"
              name="businessType"
              defaultValue=""
              aria-invalid={Boolean(fieldErrors.businessType)}
              required
            >
              <option value="" disabled>
                Select business type
              </option>
              {categories.map((category) => (
                <option key={category.code} value={category.code}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field htmlFor="city" label="City" error={fieldErrors.city}>
          <Input
            id="city"
            name="city"
            autoComplete="address-level2"
            placeholder="Mumbai"
            aria-invalid={Boolean(fieldErrors.city)}
            required
          />
        </Field>

        <List className="mb-[18px]">
          <ListRow
            title={<span id="consent-label">Consent to processing</span>}
            subtitle="We store your details, including Aadhaar and PAN, only to prepare and file your FSSAI application. You can ask us to delete them at any time."
            trailing={
              <Toggle
                checked={consent}
                onCheckedChange={setConsent}
                labelledBy="consent-label"
              />
            }
          />
        </List>

        {fieldErrors.consent && (
          <p role="alert" className="mb-[18px] text-footnote text-stop">
            {fieldErrors.consent}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mb-[18px] rounded-input bg-stop-bg px-4 py-3 text-footnote font-medium text-stop"
          >
            {error}
          </p>
        )}

        <Button type="submit" fullWidth disabled={pending}>
          {pending ? "Creating your account…" : "Create my account"}
        </Button>

        <p className="mt-3.5 text-center text-footnote leading-[1.5] text-label-2">
          Your login details appear on the next screen
          <br />
          and are sent to your phone and email.
        </p>
      </form>
    </Card>
  );
}

/* ────────────────────────────────────────────────────── credentials */

function deliveryRow(
  channel: "SMS" | "email",
  result: DeliveryResult,
): { icon: React.ReactNode; title: string; subtitle: string } {
  if (result.status === "sent") {
    return {
      icon: <ListIcon tone="done">✓</ListIcon>,
      title: `Sent by ${channel}`,
      subtitle: result.to ?? "",
    };
  }
  if (result.status === "failed") {
    return {
      icon: <ListIcon tone="wait">!</ListIcon>,
      title: `Could not send by ${channel}`,
      subtitle: `${result.to ?? ""} — copy the details above instead`,
    };
  }
  return {
    icon: <ListIcon tone="pending">·</ListIcon>,
    title: `Not sent by ${channel}`,
    subtitle: "Delivery is not switched on yet — copy the details above",
  };
}

function Credentials({ account }: { account: SignupResponse }) {
  const [copied, setCopied] = useState(false);

  async function copyDetails() {
    const text = `FoodRaksha login\nUsername: ${account.username}\nPassword: ${account.password}\nApplication: ${account.applicationNo}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  const sms = deliveryRow("SMS", account.delivery.sms);
  const email = deliveryRow("email", account.delivery.email);

  return (
    <div>
      <div className="pt-2 pb-6 text-center">
        <div
          aria-hidden="true"
          className="mx-auto mb-5 flex size-[66px] items-center justify-center rounded-full bg-ok text-[30px] text-white"
        >
          ✓
        </div>
        <h2 className="text-title-1">You&rsquo;re all set</h2>
        <p className="mt-[9px] text-body text-label-2">
          Your account is ready. Save these details.
        </p>
      </div>

      <Card tone="dark" className="mb-4">
        <div className="mb-[7px] text-caption tracking-[0.06em] text-white/[0.62] uppercase">
          Username
        </div>
        <div className="mb-5 font-mono text-[19px] font-semibold">
          {account.username}
        </div>
        <div className="mb-[7px] text-caption tracking-[0.06em] text-white/[0.62] uppercase">
          Password
        </div>
        <div className="font-mono text-[19px] font-semibold tracking-[0.06em]">
          {account.password}
        </div>
      </Card>

      <Button
        variant="secondary"
        fullWidth
        className="mb-[11px]"
        onClick={copyDetails}
      >
        {copied ? "Copied" : "Copy details"}
      </Button>
      <ButtonLink href="/login" fullWidth>
        Log in now
      </ButtonLink>

      <p className="mt-3.5 text-center text-footnote text-label-2">
        Application {account.applicationNo}
      </p>

      <List className="mt-6">
        <ListRow
          compact
          icon={sms.icon}
          title={sms.title}
          subtitle={sms.subtitle}
        />
        <ListRow
          compact
          icon={email.icon}
          title={email.title}
          subtitle={email.subtitle}
        />
      </List>
    </div>
  );
}
