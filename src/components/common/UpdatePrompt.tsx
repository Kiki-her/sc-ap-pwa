import { useRegisterSW } from "virtual:pwa-register/react";

/**
 * Service Worker の更新通知とオフライン利用可能通知を表示するトースト。
 * 新バージョン検出時にタップでリロードして適用する。
 */
export function UpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!offlineReady && !needRefresh) return null;

  function close() {
    setOfflineReady(false);
    setNeedRefresh(false);
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="safe-bottom fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4"
    >
      <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <p className="mb-3 text-sm text-gray-800 dark:text-gray-100">
          {needRefresh
            ? "新しいバージョンがあります。更新すると最新の内容で学習できます。"
            : "オフラインでも学習できる準備が完了しました。"}
        </p>
        <div className="flex gap-2">
          {needRefresh ? (
            <button
              type="button"
              onClick={() => void updateServiceWorker(true)}
              className="min-h-[44px] flex-1 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white active:bg-blue-700"
            >
              更新する
            </button>
          ) : null}
          <button
            type="button"
            onClick={close}
            className="min-h-[44px] flex-1 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 active:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:active:bg-gray-700"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
