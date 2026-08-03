export interface ChipOption<T> {
  value: T;
  label: string;
  /** 選択できない場合（該当0問など） */
  disabled?: boolean;
}

interface ChipSelectProps<T> {
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
}

export function ChipSelect<T extends string | number | undefined>({
  options,
  value,
  onChange,
  ariaLabel,
}: ChipSelectProps<T>) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={`min-h-[44px] rounded-full border px-4 text-sm font-medium transition-colors disabled:opacity-40 ${
              isActive
                ? "border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-600"
                : "border-gray-300 bg-white text-gray-700 active:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:active:bg-gray-700"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
