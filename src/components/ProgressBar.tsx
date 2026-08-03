export function ProgressBar({ value, total }: { value: number; total: number }) {
  const percent = total === 0 ? 0 : Math.round((value / total) * 100)
  return (
    <div className="progress-wrap" aria-label={`進捗 ${percent}%`}>
      <div className="progress-fill" style={{ width: `${percent}%` }} />
    </div>
  )
}
