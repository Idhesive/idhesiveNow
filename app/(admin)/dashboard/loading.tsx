import { LoadingCardSkeleton, LoadingSkeleton } from "@/components/feedback/loading-state"

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 w-full animate-pulse">
      {/* Welcome Header Skeleton */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <LoadingSkeleton className="h-8 w-64" />
          <LoadingSkeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-3">
          <LoadingSkeleton className="h-8 w-24 rounded-full" />
          <LoadingSkeleton className="h-8 w-20 rounded-full" />
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <LoadingCardSkeleton key={i} className="h-28" />
        ))}
      </div>

      {/* Stats Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <LoadingCardSkeleton key={i} className="h-24" />
        ))}
      </div>

      {/* Progress Skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        <LoadingCardSkeleton className="h-32" />
        <LoadingCardSkeleton className="h-32" />
      </div>

      {/* Activity and Profile Skeleton */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <LoadingCardSkeleton className="h-64" />
        <LoadingCardSkeleton className="h-64" />
      </div>
    </div>
  )
}
