export default function TopicLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb skeleton */}
      <div className="h-5 w-64 bg-muted rounded animate-pulse" />

      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-24 bg-muted rounded animate-pulse" />
          <div className="h-6 w-20 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="h-5 w-full max-w-xl bg-muted rounded animate-pulse" />
      </div>

      {/* Progress card skeleton */}
      <div className="h-24 bg-muted rounded-lg animate-pulse" />

      {/* Tabs skeleton */}
      <div className="h-10 w-60 bg-muted rounded animate-pulse" />

      {/* Content skeleton */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-48 bg-muted rounded-lg animate-pulse" />
        <div className="h-48 bg-muted rounded-lg animate-pulse" />
      </div>
    </div>
  )
}
