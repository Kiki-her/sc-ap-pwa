import { type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const TITLES: Record<string, string> = {
  '/': 'ホーム',
  '/settings': '出題設定',
  '/mistakes': '間違えた問題',
  '/stats': '学習履歴',
}

function resolveTitle(pathname: string) {
  if (pathname.startsWith('/quiz/')) return '出題'
  if (pathname.startsWith('/result/')) return '結果'
  return TITLES[pathname] ?? 'SC/AP 学習'
}

export function PageLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const showBack = location.pathname !== '/'

  return (
    <div className="app-shell">
      <header className="app-header">
        {showBack ? (
          <button type="button" className="link-button" onClick={() => navigate(-1)}>
            戻る
          </button>
        ) : (
          <span className="placeholder" />
        )}
        <h1>{resolveTitle(location.pathname)}</h1>
        <span className="placeholder" />
      </header>
      <main>{children}</main>
    </div>
  )
}
