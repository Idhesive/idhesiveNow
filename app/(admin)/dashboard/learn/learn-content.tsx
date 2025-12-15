"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Breadcrumb } from "@/components/navigation/breadcrumb"
import { SubjectGrid, type SubjectCardProps } from "@/components/learning/subject-card"
import { LearningPathGrid, type LearningPathCardProps } from "@/components/learning/learning-path-card"
import { ContinueLearningCard } from "@/components/dashboard/quick-actions"
import { BookOpen, Map, Sparkles } from "lucide-react"

interface LearnDashboardContentProps {
  subjects: SubjectCardProps[]
  learningPaths: LearningPathCardProps[]
}

export function LearnDashboardContent({
  subjects,
  learningPaths,
}: LearnDashboardContentProps) {
  const [activeTab, setActiveTab] = useState("subjects")

  // Find the subject with current activity
  const activeSubject = subjects.find((s) => s.currentTopic)
  const activePath = learningPaths.find((p) => p.currentItem && !p.startedAt)

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[{ label: "Learn", href: "/dashboard/learn" }]}
      />

      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Learn</h1>
        <p className="text-muted-foreground">
          Explore subjects, follow learning paths, and master new topics.
        </p>
      </div>

      {/* Continue Learning Section */}
      {(activeSubject || activePath) && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Continue Learning</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {activeSubject && (
              <ContinueLearningCard
                topicName={activeSubject.currentTopic || ""}
                subjectName={activeSubject.name}
                progress={
                  activeSubject.topicsCount
                    ? Math.round(
                        ((activeSubject.completedTopics || 0) /
                          activeSubject.topicsCount) *
                          100
                      )
                    : 0
                }
                href={`/dashboard/learn/${activeSubject.id}`}
              />
            )}
            {activePath && activePath.currentItem && (
              <ContinueLearningCard
                topicName={activePath.currentItem.topicName}
                subjectName={activePath.name}
                progress={
                  activePath.totalItems
                    ? Math.round(
                        (activePath.completedItems / activePath.totalItems) * 100
                      )
                    : 0
                }
                href={`/dashboard/learn/path/${activePath.id}`}
              />
            )}
          </div>
        </section>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="subjects" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Subjects
          </TabsTrigger>
          <TabsTrigger value="paths" className="gap-2">
            <Map className="h-4 w-4" />
            Learning Paths
          </TabsTrigger>
          <TabsTrigger value="recommended" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Recommended
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="space-y-4">
          <SubjectGrid subjects={subjects} />
        </TabsContent>

        <TabsContent value="paths" className="space-y-4">
          <LearningPathGrid paths={learningPaths} />
        </TabsContent>

        <TabsContent value="recommended" className="space-y-4">
          <RecommendedSection subjects={subjects} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface RecommendedSectionProps {
  subjects: SubjectCardProps[]
}

function RecommendedSection({ subjects }: RecommendedSectionProps) {
  // Filter subjects where user has started but not completed many topics
  const inProgressSubjects = subjects.filter(
    (s) =>
      s.topicsCount &&
      s.completedTopics !== undefined &&
      s.completedTopics > 0 &&
      s.completedTopics < s.topicsCount
  )

  // Filter subjects user hasn't started
  const newSubjects = subjects.filter(
    (s) => !s.completedTopics || s.completedTopics === 0
  )

  return (
    <div className="space-y-6">
      {inProgressSubjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Continue Where You Left Off</CardTitle>
          </CardHeader>
          <CardContent>
            <SubjectGrid subjects={inProgressSubjects.slice(0, 4)} />
          </CardContent>
        </Card>
      )}

      {newSubjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Explore New Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <SubjectGrid subjects={newSubjects.slice(0, 4)} />
          </CardContent>
        </Card>
      )}

      {inProgressSubjects.length === 0 && newSubjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">All caught up!</h3>
          <p className="text-sm text-muted-foreground mt-1">
            You&apos;ve made great progress. Keep up the good work!
          </p>
        </div>
      )}
    </div>
  )
}
