import Link from "next/link";

const links = [
  { href: "/", label: "Chat" },
  { href: "/curriculum", label: "Curriculum" },
  { href: "/exercise", label: "Coding exercise" },
  { href: "/review", label: "Code review" },
];

export function NavBar() {
  return (
    <header className="flex items-center gap-6 border-b border-[var(--border)] bg-[var(--panel)] px-6 py-3">
      <span className="text-sm font-semibold tracking-wide text-[var(--accent)]">
        Tutor
      </span>
      <nav className="flex gap-4 text-sm">
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
