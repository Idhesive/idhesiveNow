import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingStateProps {
  message?: string
  className?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingState({
  message = "Loading...",
  className,
  size = "md",
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-8",
        className
      )}
    >
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  )
}

interface LoadingSkeletonProps {
  className?: string
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
    />
  )
}

interface LoadingCardSkeletonProps {
  className?: string
}

export function LoadingCardSkeleton({ className }: LoadingCardSkeletonProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-6", className)}>
      <div className="space-y-3">
        <LoadingSkeleton className="h-4 w-1/3" />
        <LoadingSkeleton className="h-8 w-1/2" />
        <LoadingSkeleton className="h-3 w-2/3" />
      </div>
    </div>
  )
}
