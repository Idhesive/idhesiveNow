export default function QuizResultsLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Breadcrumb skeleton */}
      <div className="h-5 w-48 bg-muted rounded animate-pulse" />

      {/* Results header skeleton */}
      <div className="h-64 bg-muted rounded-lg animate-pulse" />

      {/* Stats grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>

      {/* Actions skeleton */}
      <div className="flex gap-3 justify-center">
        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
      </div>

      {/* Tabs skeleton */}
      <div className="h-10 w-60 bg-muted rounded animate-pulse" />

      {/* Content skeleton */}
      <div className="h-48 bg-muted rounded-lg animate-pulse" />
    </div>
  )
}
