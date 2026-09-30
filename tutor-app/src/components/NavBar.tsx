import Link from "next/link";

const links = [
  { href: "/", label: "Chat" },
  { href: "/curriculum", label: "Curriculum" },
  { href: "/exercise", label: "Coding exercise" },
  { href: "/review", label: "Code review" },
];

export function NavBar() {
  return (
    <header className="flex items-center gap-4 overflow-x-auto border-b border-[var(--border)] bg-[var(--panel)] px-4 py-3 md:gap-6 md:px-6">
      <span className="shrink-0 text-sm font-semibold tracking-wide text-[var(--accent)]">
        Tutor
      </span>
      <nav className="flex shrink-0 gap-3 text-sm whitespace-nowrap md:gap-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
