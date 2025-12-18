"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/navigation/breadcrumb"
import {
  Calendar,
  Target,
  Users,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ChallengeHistoryData {
  challenges: {
    id: string
    challengeDate: Date
    questionCount: number
    totalParticipants: number
    averageScore: number | null
    templateName: string | null
    templateDescription: string | null
    userCompleted: boolean
    userScore: number | undefined
  }[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface ChallengeHistoryContentProps {
  data: ChallengeHistoryData
  currentPage: number
}

export function ChallengeHistoryContent({ data, currentPage }: ChallengeHistoryContentProps) {
  const router = useRouter()

  const handlePageChange = (newPage: number) => {
    router.push(`/dashboard/practice/daily/history?page=${newPage}`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Practice", href: "/dashboard/practice" },
          { label: "Daily Challenge", href: "/dashboard/practice/daily" },
          { label: "History", href: "/dashboard/practice/daily/history" },
        ]}
      />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Challenge History</h1>
          <p className="text-muted-foreground">
            Browse and replay past daily challenges
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/practice/daily">Today&apos;s Challenge</Link>
        </Button>
      </div>

      {/* Challenges List */}
      {data.challenges.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No Challenges Yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Past challenges will appear here once they&apos;re available.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {data.challenges.map((challenge) => {
            const challengeDateStr = new Date(challenge.challengeDate)
              .toISOString()
              .split("T")[0]
            const isToday =
              new Date().toDateString() === new Date(challenge.challengeDate).toDateString()

            return (
              <Card
                key={challenge.id}
                className={cn(
                  "transition-all hover:shadow-md",
                  challenge.userCompleted && "border-green-500/20"
                )}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {new Date(challenge.challengeDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </CardTitle>
                      {challenge.templateName && (
                        <p className="text-sm text-muted-foreground">
                          {challenge.templateName}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {isToday && (
                        <Badge variant="default">Today</Badge>
                      )}
                      {challenge.userCompleted && (
                        <Badge variant="outline" className="border-green-500/50 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between">
                    {/* Challenge Stats */}
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span>{challenge.questionCount} questions</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{challenge.totalParticipants} participants</span>
                      </div>
                      {challenge.averageScore !== null && (
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span>Avg: {challenge.averageScore.toFixed(0)}</span>
                        </div>
                      )}
                    </div>

                    {/* User Score or Action Button */}
                    <div className="flex items-center gap-3">
                      {challenge.userCompleted && challenge.userScore !== undefined && (
                        <div className="text-right mr-3">
                          <p className="text-sm font-medium">Your Score</p>
                          <p className="text-2xl font-bold">{challenge.userScore.toFixed(0)}</p>
                        </div>
                      )}
                      <Button asChild variant={challenge.userCompleted ? "outline" : "default"}>
                        <Link href={`/dashboard/practice/daily?date=${challengeDateStr}`}>
                          {challenge.userCompleted ? "View Details" : "Start Challenge"}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= data.totalPages - 1}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
