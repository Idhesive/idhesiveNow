"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Calculator,
  FlaskConical,
  Globe,
  Languages,
  Palette,
  Music,
  Dumbbell,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Icon mapping for subjects
const subjectIcons: Record<string, LucideIcon> = {
  MATH: Calculator,
  MATHEMATICS: Calculator,
  ENG: Languages,
  ENGLISH: Languages,
  SCIENCE: FlaskConical,
  NATURAL_SCIENCE: FlaskConical,
  HISTORY: Globe,
  GEOGRAPHY: Globe,
  SOCIAL_SCIENCE: Globe,
  ART: Palette,
  CREATIVE_ARTS: Palette,
  MUSIC: Music,
  PE: Dumbbell,
  PHYSICAL_EDUCATION: Dumbbell,
  DEFAULT: BookOpen,
}

export interface SubjectCardProps {
  id: string
  code: string
  name: string
  description?: string | null
  color?: string | null
  icon?: string | null
  topicsCount?: number
  completedTopics?: number
  currentTopic?: string | null
  className?: string
}

export function SubjectCard({
  id,
  code,
  name,
  description,
  color,
  topicsCount = 0,
  completedTopics = 0,
  currentTopic,
  className,
}: SubjectCardProps) {
  const Icon = subjectIcons[code.toUpperCase()] || subjectIcons.DEFAULT
  const progress = topicsCount > 0 ? (completedTopics / topicsCount) * 100 : 0
  const bgColor = color || "#6366f1"

  return (
    <Link href={`/dashboard/learn/${id}`}>
      <Card
        className={cn(
          "group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1",
          className
        )}
      >
        {/* Color accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: bgColor }}
        />

        <CardContent className="p-5 pt-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${bgColor}20` }}
            >
              <Icon className="h-6 w-6" style={{ color: bgColor }} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">{name}</h3>
              {description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Progress section */}
          {topicsCount > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {completedTopics}/{topicsCount} topics
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Current topic badge */}
          {currentTopic && (
            <div className="mt-3">
              <Badge variant="secondary" className="text-xs">
                Current: {currentTopic}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

interface SubjectGridProps {
  subjects: SubjectCardProps[]
  className?: string
}

export function SubjectGrid({ subjects, className }: SubjectGridProps) {
  if (subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No subjects available</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Subjects will appear here once they are configured.
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {subjects.map((subject) => (
        <SubjectCard key={subject.id} {...subject} />
      ))}
    </div>
  )
}
