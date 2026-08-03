interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = "📘",
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
      <p className="mb-2 text-3xl" aria-hidden="true">
        {icon}
      </p>
      <p className="mb-1 text-base font-semibold text-gray-900 dark:text-gray-100">{title}</p>
      {description ? (
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="min-h-[48px] w-full rounded-xl bg-blue-600 px-4 font-semibold text-white active:bg-blue-700"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
