import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  change?: {
    value: number
    type: "increase" | "decrease" | "neutral"
  }
  description?: string
  className?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  change,
  description,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("py-4", className)}>
      <CardContent className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {change && (
              <span
                className={cn(
                  "text-xs font-medium",
                  change.type === "increase" && "text-green-600 dark:text-green-400",
                  change.type === "decrease" && "text-red-600 dark:text-red-400",
                  change.type === "neutral" && "text-muted-foreground"
                )}
              >
                {change.type === "increase" && "+"}
                {change.type === "decrease" && "-"}
                {Math.abs(change.value)}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
