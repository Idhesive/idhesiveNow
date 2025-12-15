"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Breadcrumb } from "@/components/navigation/breadcrumb"
import { StatCard } from "@/components/data-display/stat-card"
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock,
  FileText,
  HelpCircle,
  Lightbulb,
  PlayCircle,
  Target,
  Video,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TopicData {
  topic: {
    id: string
    code: string
    name: string
    description: string | null
    learningGoals: string[]
    prerequisites: string[]
    estimatedHours: number | null
  }
  subject: {
    id: string
    name: string
    color: string | null
  }
  gradeLevel: {
    id: string
    name: string
    grade: number
  }
  subtopics: {
    id: string
    name: string
    description: string | null
  }[]
  tutorials: {
    id: string
    title: string
    type: string
    estimatedMinutes: number | null
  }[]
  progress: {
    masteryLevel: number
    totalQuestions: number
    answeredQuestions: number
    correctAnswers: number
    accuracy: number
  }
}

interface TopicLearnContentProps {
  data: TopicData
  subjectId: string
}

const contentTypeIcons: Record<string, typeof FileText> = {
  VIDEO: Video,
  TEXT: FileText,
  INTERACTIVE: Lightbulb,
  EXAMPLE: BookOpen,
}

export function TopicLearnContent({ data, subjectId }: TopicLearnContentProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const { topic, subject, gradeLevel, subtopics, tutorials, progress } = data

  const masteryPercent = Math.round(progress.masteryLevel * 100)
  const accuracyPercent = Math.round(progress.accuracy * 100)

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: "Learn", href: "/dashboard/learn" },
          { label: subject.name, href: `/dashboard/learn/${subjectId}` },
          { label: topic.name, href: `/dashboard/learn/${subjectId}/${topic.id}` },
        ]}
      />

      {/* Topic Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                style={{ borderColor: subject.color || undefined }}
              >
                {subject.name}
              </Badge>
              <Badge variant="secondary">{gradeLevel.name}</Badge>
              {topic.estimatedHours && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {topic.estimatedHours}h estimated
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{topic.name}</h1>
            {topic.description && (
              <p className="text-muted-foreground">{topic.description}</p>
            )}
          </div>

          <Button asChild>
            <Link href={`/dashboard/practice?topic=${topic.id}`}>
              <PlayCircle className="h-4 w-4 mr-2" />
              Practice
            </Link>
          </Button>
        </div>

        {/* Progress Card */}
        <Card>
          <CardContent className="p-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Mastery</span>
                  <span className="font-medium">{masteryPercent}%</span>
                </div>
                <Progress value={masteryPercent} className="h-2" />
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{progress.answeredQuestions}</div>
                <div className="text-xs text-muted-foreground">
                  Questions Answered
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">
                  {progress.correctAnswers}
                </div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{accuracyPercent}%</div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="learn">Learn</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Learning Goals */}
            {topic.learningGoals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Learning Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {topic.learningGoals.map((goal, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Prerequisites */}
            {topic.prerequisites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Prerequisites
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {topic.prerequisites.map((prereq, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {prereq}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Subtopics */}
            {subtopics.length > 0 && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Subtopics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {subtopics.map((subtopic) => (
                      <Link
                        key={subtopic.id}
                        href={`/dashboard/learn/${subjectId}/${subtopic.id}`}
                        className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors"
                      >
                        <span className="text-sm font-medium">{subtopic.name}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="learn" className="space-y-4">
          {tutorials.length > 0 ? (
            <div className="space-y-3">
              {tutorials.map((tutorial) => {
                const Icon = contentTypeIcons[tutorial.type] || FileText
                return (
                  <Card
                    key={tutorial.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{tutorial.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {tutorial.type}
                            </Badge>
                            {tutorial.estimatedMinutes && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {tutorial.estimatedMinutes} min
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No tutorials yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Tutorial content for this topic is coming soon.
                </p>
                <Button className="mt-4" asChild>
                  <Link href={`/dashboard/practice?topic=${topic.id}`}>
                    Jump to Practice
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="practice" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Questions Available"
              value={progress.totalQuestions}
              icon={HelpCircle}
            />
            <StatCard
              label="Questions Answered"
              value={progress.answeredQuestions}
              icon={CheckCircle}
            />
            <StatCard
              label="Accuracy"
              value={`${accuracyPercent}%`}
              icon={Target}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Practice Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <PracticeOption
                title="Quick Practice"
                description="Answer 5 random questions from this topic"
                href={`/dashboard/practice?topic=${topic.id}&mode=quick`}
                icon={PlayCircle}
              />
              <PracticeOption
                title="Full Assessment"
                description="Complete a comprehensive assessment"
                href={`/dashboard/practice?topic=${topic.id}&mode=assessment`}
                icon={Target}
              />
              <PracticeOption
                title="Review Mistakes"
                description="Practice questions you got wrong"
                href={`/dashboard/practice?topic=${topic.id}&mode=review`}
                icon={BookOpen}
                disabled={progress.answeredQuestions - progress.correctAnswers === 0}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface PracticeOptionProps {
  title: string
  description: string
  href: string
  icon: typeof PlayCircle
  disabled?: boolean
}

function PracticeOption({
  title,
  description,
  href,
  icon: Icon,
  disabled,
}: PracticeOptionProps) {
  const content = (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg border transition-colors",
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-muted cursor-pointer"
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </div>
  )

  if (disabled) {
    return content
  }

  return <Link href={href}>{content}</Link>
}
