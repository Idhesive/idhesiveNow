export default function PracticeLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb skeleton */}
      <div className="h-5 w-32 bg-muted rounded animate-pulse" />

      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-5 w-96 bg-muted rounded animate-pulse" />
      </div>

      {/* Stats card skeleton */}
      <div className="h-32 bg-muted rounded-lg animate-pulse" />

      {/* Daily challenge & recommendations row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-48 bg-muted rounded-lg animate-pulse" />
        <div className="lg:col-span-2 h-48 bg-muted rounded-lg animate-pulse" />
      </div>

      {/* Tabs skeleton */}
      <div className="h-10 w-80 bg-muted rounded animate-pulse" />

      {/* Content skeleton */}
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  )
}
