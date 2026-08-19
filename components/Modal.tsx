"use client";

export default function Modal({
  title,
  onClose,
  closeLabel,
  children,
}: {
  title: string;
  onClose: () => void;
  closeLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="bloom-card max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl p-5 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-kiosk-base font-extrabold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="bloom-btn-secondary flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
