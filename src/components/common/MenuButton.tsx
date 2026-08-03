interface MenuButtonProps {
  label: string;
  description?: string;
  /** 先頭に表示する記号やアイコン文字 */
  icon: string;
  onClick: () => void;
  variant?: "default" | "primary";
  disabled?: boolean;
}

export function MenuButton({
  label,
  description,
  icon,
  onClick,
  variant = "default",
  disabled = false,
}: MenuButtonProps) {
  const base =
    "flex w-full min-h-[56px] items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "border-blue-600 bg-blue-600 text-white active:bg-blue-700 dark:border-blue-500 dark:bg-blue-600"
      : "border-gray-200 bg-white text-gray-900 active:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:active:bg-gray-700";

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${styles}`}>
      <span className="text-xl leading-none" aria-hidden="true">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-semibold">{label}</span>
        {description ? (
          <span
            className={`block truncate text-xs ${
              variant === "primary" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {description}
          </span>
        ) : null}
      </span>
      <span
        className={`text-lg ${variant === "primary" ? "text-blue-100" : "text-gray-400"}`}
        aria-hidden="true"
      >
        →
      </span>
    </button>
  );
}
