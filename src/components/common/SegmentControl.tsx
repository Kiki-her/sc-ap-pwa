export interface SegmentOption<T> {
  value: T;
  label: string;
}

interface SegmentControlProps<T> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
}

export function SegmentControl<T extends string | number | undefined>({
  options,
  value,
  onChange,
  ariaLabel,
}: SegmentControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex gap-1 rounded-xl bg-gray-200 p-1 dark:bg-gray-700"
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={`min-h-[44px] flex-1 rounded-lg px-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-white text-blue-700 shadow-sm dark:bg-gray-900 dark:text-blue-300"
                : "text-gray-600 active:bg-gray-300 dark:text-gray-300 dark:active:bg-gray-600"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
