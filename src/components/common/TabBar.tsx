export interface TabItem<T> {
  value: T;
  label: string;
}

interface TabBarProps<T> {
  tabs: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
}

export function TabBar<T extends string>({ tabs, value, onChange, ariaLabel }: TabBarProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex border-b border-gray-200 dark:border-gray-700"
    >
      {tabs.map((tab) => {
        const isActive = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={`min-h-[44px] flex-1 border-b-2 px-2 text-sm font-medium transition-colors ${
              isActive
                ? "border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-300"
                : "border-transparent text-gray-500 active:bg-gray-100 dark:text-gray-400 dark:active:bg-gray-800"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
