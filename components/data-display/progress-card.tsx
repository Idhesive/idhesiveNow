"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ProgressCardProps {
  title: string
  current: number
  target: number
  unit?: string
  showPercentage?: boolean
  description?: string
  className?: string
  progressClassName?: string
}

export function ProgressCard({
  title,
  current,
  target,
  unit = "",
  showPercentage = true,
  description,
  className,
  progressClassName,
}: ProgressCardProps) {
  const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0

  return (
    <Card className={cn("py-4", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {showPercentage && (
            <span className="text-sm font-semibold text-primary">{percentage}%</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Progress value={percentage} className={cn("h-2", progressClassName)} />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {current}
            {unit} / {target}
            {unit}
          </span>
          {description && <span>{description}</span>}
        </div>
      </CardContent>
    </Card>
  )
}
