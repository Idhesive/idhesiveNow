import { cn } from "@/lib/utils"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading this content. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-destructive">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          className="mt-4 gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  )
}
