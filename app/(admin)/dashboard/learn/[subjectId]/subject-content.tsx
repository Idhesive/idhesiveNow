"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Breadcrumb } from "@/components/navigation/breadcrumb"
import { TopicList, type TopicCardProps } from "@/components/learning/topic-card"
import { TopicTree, type TopicTreeNode } from "@/components/learning/topic-tree"
import { StatCard } from "@/components/data-display/stat-card"
import {
  BookOpen,
  CheckCircle,
  Clock,
  List,
  Network,
  Target,
} from "lucide-react"

interface SubjectData {
  subject: {
    id: string
    code: string
    name: string
    description: string | null
    color: string | null
  }
  gradeLevelId: string | undefined
  gradeLevelName: string | undefined
  topicTree: TopicTreeNode[]
  flatTopics: TopicCardProps[]
  stats: {
    totalTopics: number
    completedTopics: number
    inProgressTopics: number
  }
}

interface SubjectDetailContentProps {
  data: SubjectData
}

export function SubjectDetailContent({ data }: SubjectDetailContentProps) {
  const [viewMode, setViewMode] = useState<"list" | "tree">("list")
  const { subject, gradeLevelName, topicTree, flatTopics, stats } = data

  const progress =
    stats.totalTopics > 0
      ? Math.round((stats.completedTopics / stats.totalTopics) * 100)
      : 0

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: "Learn", href: "/dashboard/learn" },
          { label: subject.name, href: `/dashboard/learn/${subject.id}` },
        ]}
      />

      {/* Subject Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{subject.name}</h1>
              {gradeLevelName && (
                <Badge variant="secondary">{gradeLevelName}</Badge>
              )}
            </div>
            {subject.description && (
              <p className="text-muted-foreground">{subject.description}</p>
            )}
          </div>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-6">
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.completedTopics}
                  </div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.inProgressTopics}
                  </div>
                  <div className="text-xs text-muted-foreground">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.totalTopics}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topics Section */}
      <Tabs defaultValue="topics" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="topics">Topics</TabsTrigger>
            <TabsTrigger value="progress">My Progress</TabsTrigger>
          </TabsList>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 border rounded-md p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded ${
                viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("tree")}
              className={`p-1.5 rounded ${
                viewMode === "tree"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
              title="Tree view"
            >
              <Network className="h-4 w-4" />
            </button>
          </div>
        </div>

        <TabsContent value="topics">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                All Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {viewMode === "list" ? (
                <TopicList topics={flatTopics} />
              ) : (
                <TopicTree topics={topicTree} subjectId={subject.id} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Topics Completed"
              value={stats.completedTopics}
              icon={CheckCircle}
              description={`of ${stats.totalTopics} total topics`}
            />
            <StatCard
              label="In Progress"
              value={stats.inProgressTopics}
              icon={Clock}
              description="topics currently studying"
            />
            <StatCard
              label="Mastery Rate"
              value={`${progress}%`}
              icon={Target}
              description="overall subject mastery"
            />
          </div>

          {/* Progress by status */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Topic Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <TopicStatusSection
                  title="Completed"
                  topics={flatTopics.filter((t) => t.status === "completed")}
                  emptyMessage="No topics completed yet"
                  subjectId={subject.id}
                />
                <TopicStatusSection
                  title="In Progress"
                  topics={flatTopics.filter((t) => t.status === "in_progress")}
                  emptyMessage="No topics in progress"
                  subjectId={subject.id}
                />
                <TopicStatusSection
                  title="Available"
                  topics={flatTopics.filter((t) => t.status === "available")}
                  emptyMessage="No topics available"
                  subjectId={subject.id}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface TopicStatusSectionProps {
  title: string
  topics: TopicCardProps[]
  emptyMessage: string
  subjectId: string
}

function TopicStatusSection({
  title,
  topics,
  emptyMessage,
}: TopicStatusSectionProps) {
  if (topics.length === 0) {
    return (
      <div>
        <h4 className="text-sm font-medium mb-2">{title}</h4>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div>
      <h4 className="text-sm font-medium mb-2">
        {title} ({topics.length})
      </h4>
      <TopicList topics={topics.slice(0, 5)} />
      {topics.length > 5 && (
        <p className="text-sm text-muted-foreground mt-2">
          +{topics.length - 5} more
        </p>
      )}
    </div>
  )
}
