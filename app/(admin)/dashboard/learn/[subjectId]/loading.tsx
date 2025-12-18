export default function SubjectLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb skeleton */}
      <div className="h-5 w-48 bg-muted rounded animate-pulse" />

      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-6 w-20 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-5 w-96 bg-muted rounded animate-pulse" />
      </div>

      {/* Progress card skeleton */}
      <div className="h-24 bg-muted rounded-lg animate-pulse" />

      {/* Tabs skeleton */}
      <div className="h-10 w-60 bg-muted rounded animate-pulse" />

      {/* Topics skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  )
}
