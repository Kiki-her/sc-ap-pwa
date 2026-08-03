import type { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="safe-x safe-bottom mx-auto max-w-lg px-4 pt-4 pb-8">{children}</div>
    </div>
  );
}
