type StateIconName = "basket" | "warning" | "check";

export default function StateIcon({ name, className = "h-12 w-12" }: { name: StateIconName; className?: string }) {
  const common = `${className} shrink-0`;

  if (name === "warning") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M10.3 3.7 2.4 17.4A2.1 2.1 0 0 0 4.2 20h15.6a2.1 2.1 0 0 0 1.8-2.6L13.7 3.7a2 2 0 0 0-3.4 0Z" />
        <path d="M12 8v5M12 16.8v.2" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
        <path d="m5 12.5 4.2 4.2L19.5 6.5" />
      </svg>
    );
  }

  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 9h16l-1.5 11h-13L4 9Z" />
      <path d="m8 9 4-6 4 6M9 13v3M15 13v3" />
    </svg>
  );
}
