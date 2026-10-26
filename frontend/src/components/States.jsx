export function LoadingSkeleton({ rows = 5 }) {
  return (
    <div className="w-full space-y-3 animate-pulse p-4">
      <div className="h-6 bg-surface-container rounded w-1/4 mb-4"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 bg-surface-container-low rounded-lg w-full"></div>
      ))}
    </div>
  )
}

export function EmptyState({ title = 'No records found', message = 'No data matching your current filters.' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-container-lowest rounded-xl">
      <span className="material-symbols-outlined text-[48px] text-outline-variant mb-2">inbox</span>
      <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">{title}</h3>
      <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mt-1">{message}</p>
    </div>
  )
}

export function ErrorState({ message = 'An error occurred while loading data.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-error-container/20 border border-error-container rounded-xl">
      <span className="material-symbols-outlined text-[48px] text-error mb-2">error</span>
      <h3 className="font-headline-sm text-headline-sm text-error font-semibold">Error Loading Data</h3>
      <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mt-1 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md shadow-sm hover:bg-primary-container transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
