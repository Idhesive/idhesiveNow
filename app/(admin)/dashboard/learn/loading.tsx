import { LoadingCardSkeleton } from "@/components/feedback/loading-state"

export default function LearnLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb skeleton */}
      <div className="h-5 w-32 bg-muted rounded animate-pulse" />

      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-5 w-96 bg-muted rounded animate-pulse" />
      </div>

      {/* Tabs skeleton */}
      <div className="h-10 w-80 bg-muted rounded animate-pulse" />

      {/* Subject grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <LoadingCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
