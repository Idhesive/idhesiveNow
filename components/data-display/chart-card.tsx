"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface ChartCardProps {
  title: string
  description?: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function ChartCard({
  title,
  description,
  children,
  action,
  className,
}: ChartCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
