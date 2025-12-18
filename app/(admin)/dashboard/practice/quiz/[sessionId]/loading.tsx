export default function QuizSessionLoading() {
  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-6 w-16 bg-muted rounded animate-pulse" />
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-6 w-20 bg-muted rounded animate-pulse" />
        </div>
      </div>

      {/* Progress bar skeleton */}
      <div className="h-2 w-full bg-muted rounded animate-pulse" />

      {/* Question card skeleton */}
      <div className="h-[400px] bg-muted rounded-lg animate-pulse" />

      {/* Action buttons skeleton */}
      <div className="flex justify-end">
        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
      </div>
    </div>
  )
}
