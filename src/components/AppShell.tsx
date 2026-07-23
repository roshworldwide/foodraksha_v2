"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/cn";
import { logout } from "@/lib/auth/actions";

/* ─────────────────────────────────────────────────────────── nav data */

type Role = "CUSTOMER" | "STAFF";

interface NavItem {
  label: string;
  href: string;
  icon: keyof typeof ICONS;
  /** Exact-match only — for filtered list views that share a pathname. */
  exact?: boolean;
}

interface NavGroup {
  heading: string;
  items: NavItem[];
}

// The two portals have completely different navigation. Neither is ever
// rendered for the other role.
const NAV: Record<Role, NavGroup[]> = {
  CUSTOMER: [
    {
      heading: "Your application",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: "home" },
        { label: "My application", href: "/application", icon: "doc" },
        { label: "Documents", href: "/application/documents", icon: "folder" },
      ],
    },
    {
      heading: "Account",
      items: [{ label: "Account", href: "/account", icon: "user" }],
    },
  ],
  STAFF: [
    {
      heading: "Sales",
      items: [
        { label: "Dashboard", href: "/staff", icon: "home", exact: true },
        { label: "Leads", href: "/staff/leads", icon: "spark" },
        { label: "Pipeline", href: "/staff/pipeline", icon: "board" },
        {
          label: "Website Enquiries",
          href: "/staff/enquiries",
          icon: "inbox",
        },
      ],
    },
    {
      heading: "Clients & Compliance",
      items: [
        { label: "Clients / FBOs", href: "/staff/clients", icon: "building" },
        { label: "Compliance", href: "/staff/compliance", icon: "shield" },
      ],
    },
    {
      heading: "Licensing",
      items: [
        {
          label: "New Application",
          href: "/staff/new-application",
          icon: "plus",
        },
        { label: "Application Form B", href: "/staff/form-b", icon: "doc" },
        { label: "Modification", href: "/staff/modifications", icon: "edit" },
        { label: "Renewals", href: "/staff/renewals", icon: "refresh" },
      ],
    },
    {
      heading: "Annual Returns",
      items: [
        {
          label: "Return Information",
          href: "/staff/annual-returns",
          icon: "calendar",
          exact: true,
        },
        {
          label: "Return Submission",
          href: "/staff/annual-returns/submissions",
          icon: "upload",
        },
      ],
    },
    {
      heading: "Registrations",
      items: [
        {
          label: "FBO Registration",
          href: "/staff/registrations",
          icon: "badge",
        },
        {
          label: "Product Specification",
          href: "/staff/product-specs",
          icon: "tag",
        },
        { label: "NOC / Address", href: "/staff/noc", icon: "folder" },
        { label: "Form IX", href: "/staff/form-ix", icon: "award" },
      ],
    },
  ],
};

/** Page title per route prefix, longest match wins. */
const TITLES: [string, string][] = [
  ["/staff/applications", "Filing workspace"],
  ["/staff/leads", "Leads"],
  ["/staff/pipeline", "Pipeline"],
  ["/staff/enquiries", "Website enquiries"],
  ["/staff/clients", "Clients / FBOs"],
  ["/staff/compliance", "Compliance"],
  ["/staff/new-application", "New application"],
  ["/staff/form-b", "Application Form B"],
  ["/staff/modifications", "Modifications"],
  ["/staff/renewals", "Renewals (legacy licences)"],
  ["/staff/annual-returns/submissions", "Annual return submission"],
  ["/staff/annual-returns", "Annual return information"],
  ["/staff/registrations", "FBO regulatory registration"],
  ["/staff/product-specs", "Product specification"],
  ["/staff/noc", "NOC / address ownership"],
  ["/staff/form-ix", "Form IX"],
  ["/staff", "Dashboard"],
  ["/application/review", "Review & submit"],
  ["/application", "Your application"],
  ["/dashboard", "Dashboard"],
  ["/account", "Account"],
];

function titleFor(pathname: string): string {
  for (const [prefix, title] of TITLES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return title;
  }
  return "FoodRaksha";
}

/* ─────────────────────────────────────────────────────────── shell */

export interface AppShellProps {
  role: Role;
  userName: string;
  userSubtitle: string;
  accountHref?: string;
  children: React.ReactNode;
}

export function AppShell({
  role,
  userName,
  userSubtitle,
  accountHref,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const params = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);

  // Read the saved sidebar preference once on mount. This is a genuine sync
  // from an external store (localStorage), which the effect-setState rule
  // flags as a false positive.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(localStorage.getItem("fr-sidebar") === "collapsed");
  }, []);
  function toggleSidebar() {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem("fr-sidebar", next ? "collapsed" : "open");
      return next;
    });
  }

  const groups = NAV[role];
  const currentFilter = params.get("filter");

  function isActive(item: NavItem): boolean {
    const [path, query] = item.href.split("?");
    if (pathname !== path && !pathname.startsWith(`${path}/`)) {
      // Different pathname entirely.
      if (item.exact || !pathname.startsWith(path)) return false;
    }
    if (query) {
      // Filtered staff view: the filter param must match.
      const wanted = new URLSearchParams(query).get("filter");
      return pathname === path && currentFilter === wanted;
    }
    if (path === "/staff") {
      // "All applications" is active only with no filter chosen.
      return pathname === "/staff" && !currentFilter;
    }
    if (item.exact) return pathname === path;
    // Longest-prefix wins, so a deeper item does not also light this one.
    return (
      (pathname === path || pathname.startsWith(`${path}/`)) &&
      !groups.some((group) =>
        group.items.some(
          (other) =>
            other !== item &&
            other.href.length > item.href.length &&
            (pathname === other.href ||
              pathname.startsWith(`${other.href.split("?")[0]}/`)),
        ),
      )
    );
  }

  return (
    <div className="flex min-h-screen bg-bg">
      {/* ── Sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r-[0.5px] border-separator bg-white-titanium-lt md:flex",
          collapsed ? "w-[68px]" : "w-[240px]",
          "transition-[width] duration-200 ease-ios",
        )}
      >
        <div className="flex h-16 items-center px-4">
          <Link
            href={role === "CUSTOMER" ? "/dashboard" : "/staff"}
            aria-label="FoodRaksha home"
          >
            <Logo
              variant={collapsed ? "mark" : "lockup"}
              height={collapsed ? 26 : 24}
            />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 py-2">
          {groups.map((group) => (
            <div key={group.heading} className="mb-5">
              {!collapsed && (
                <p className="px-2.5 pb-1.5 text-[11px] font-semibold tracking-[0.05em] text-label-3 uppercase">
                  {group.heading}
                </p>
              )}
              <ul className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = isActive(item);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-subhead transition-colors",
                          collapsed && "justify-center",
                          active
                            ? "bg-white-titanium font-semibold text-label shadow-1"
                            : "text-label-2 hover:bg-white-titanium/60 hover:text-label",
                        )}
                      >
                        <Icon
                          name={item.icon}
                          className={cn(
                            "size-[18px] shrink-0",
                            active ? "text-graphite" : "text-label-3",
                          )}
                        />
                        {!collapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── Footer: back to website (staff), user block, logout */}
        <div className="border-t-[0.5px] border-separator p-2.5">
          {role === "STAFF" && (
            <Link
              href="/"
              title="Back to website"
              className={cn(
                "mb-1 flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-subhead text-label-2 transition-colors hover:bg-white-titanium/60 hover:text-label",
                collapsed && "justify-center",
              )}
            >
              <Icon
                name="globe"
                className="size-[18px] shrink-0 text-label-3"
              />
              {!collapsed && "Back to website"}
            </Link>
          )}
          <div
            className={cn(
              "flex items-center gap-2.5 rounded-[10px] px-2 py-2",
              collapsed && "justify-center",
            )}
          >
            <Avatar name={userName} />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-footnote font-semibold text-label">
                  {userName}
                </p>
                <p className="truncate text-[12px] text-label-2">
                  {userSubtitle}
                </p>
              </div>
            )}
          </div>
          <form action={logout} className="mt-1">
            <button
              type="submit"
              title="Sign out"
              className={cn(
                "flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-subhead text-label-2 transition-colors hover:bg-white-titanium/60 hover:text-label",
                collapsed && "justify-center",
              )}
            >
              <Icon
                name="logout"
                className="size-[18px] shrink-0 text-label-3"
              />
              {!collapsed && "Sign out"}
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          title={titleFor(pathname)}
          onToggleSidebar={toggleSidebar}
          userName={userName}
          accountHref={accountHref}
        />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── top bar */

const DATE = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "Asia/Kolkata",
});

function TopBar({
  title,
  onToggleSidebar,
  userName,
  accountHref,
}: {
  title: string;
  onToggleSidebar: () => void;
  userName: string;
  accountHref?: string;
}) {
  // The IST date, computed at render. Deterministic per day, so SSR and client
  // agree; suppressHydrationWarning covers the rare midnight-boundary case.
  const today = DATE.format(new Date());

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b-[0.5px] border-separator bg-white-titanium/[0.82] px-4 backdrop-blur-[20px] backdrop-saturate-[180%]">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        className="hidden rounded-[10px] p-2 text-label-2 hover:bg-white-titanium hover:text-label md:block"
      >
        <Icon name="menu" className="size-[18px]" />
      </button>

      <h1 className="text-headline">{title}</h1>

      <div className="ml-auto flex items-center gap-1">
        <span
          suppressHydrationWarning
          className="mr-2 hidden text-footnote text-label-2 sm:block"
        >
          {today}
        </span>
        <IconButton
          name="help"
          label="Help"
          href="mailto:support@foodraksha.in"
        />
        <IconButton name="bell" label="Notifications" />
        {/* Theme control is a placeholder: the product is single-theme
            Titanium today. TODO(theme): wire a dark palette if the client
            wants one. */}
        <IconButton name="theme" label="Theme (coming soon)" disabled />
        {accountHref ? (
          <Link href={accountHref} aria-label="Account" className="ml-1">
            <Avatar name={userName} />
          </Link>
        ) : (
          <span className="ml-1">
            <Avatar name={userName} />
          </span>
        )}
      </div>
    </header>
  );
}

function IconButton({
  name,
  label,
  href,
  disabled,
}: {
  name: keyof typeof ICONS;
  label: string;
  href?: string;
  disabled?: boolean;
}) {
  const className = cn(
    "flex rounded-[10px] p-2 text-label-2 transition-colors",
    disabled
      ? "cursor-default opacity-40"
      : "hover:bg-white-titanium hover:text-label",
  );
  if (href && !disabled) {
    return (
      <a href={href} title={label} aria-label={label} className={className}>
        <Icon name={name} className="size-[18px]" />
      </a>
    );
  }
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      className={className}
    >
      <Icon name={name} className="size-[18px]" />
    </button>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-nat-titanium text-[13px] font-semibold text-white">
      {initials || "?"}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────── icons */

const ICONS = {
  home: "M3 10.5 12 3l9 7.5M5 9.5V20h5v-6h4v6h5V9.5",
  doc: "M6 2h8l4 4v16H6zM14 2v4h4",
  folder: "M3 6h6l2 2h10v11H3z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2",
  inbox: "M22 12h-6l-2 3h-4l-2-3H2M5 5h14l3 7v7H2v-7z",
  flag: "M4 21V4M4 4h13l-2 4 2 4H4",
  check: "M20 6 9 17l-5-5",
  award: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM9 14l-1 7 4-2 4 2-1-7",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  menu: "M3 6h18M3 12h18M3 18h18",
  globe:
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.7 3.9 6.3 4 9.9-.1 3.6-1.5 7.2-4 9.9-2.5-2.7-3.9-6.3-4-9.9.1-3.6 1.5-7.2 4-9.9z",
  help: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9.5 9a2.5 2.5 0 0 1 4.5 1.5c0 2-2.5 2-2.5 4M12 17h.01",
  bell: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  spark:
    "M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M17.7 6.3l-2.8 2.8M9.1 14.9l-2.8 2.8",
  board: "M4 4h16v16H4zM9 4v16M15 4v16",
  building:
    "M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11M8 8h.01M8 12h.01M11 8h.01M11 12h.01M8 16h4",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4",
  plus: "M12 5v14M5 12h14",
  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z",
  refresh:
    "M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5",
  calendar: "M4 5h16v16H4zM4 9h16M8 3v4M16 3v4",
  upload: "M12 15V3M8 7l4-4 4 4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2",
  badge: "M12 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 15v6l-3-2-3 2v-8M18 13v8l-3-2",
  tag: "M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0l-7.2-7.2a2 2 0 0 1-.6-1.4V4a1 1 0 0 1 1-1h8a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.6zM7.5 7.5h.01",
  theme:
    "M12 3v2M12 19v2M5 12H3M21 12h-2M6 6 4.5 4.5M19.5 19.5 18 18M18 6l1.5-1.5M4.5 19.5 6 18M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
} as const;

function Icon({
  name,
  className,
}: {
  name: keyof typeof ICONS;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={ICONS[name]} />
    </svg>
  );
}
