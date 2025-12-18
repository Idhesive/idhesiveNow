"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Breadcrumb } from "@/components/navigation/breadcrumb"
import {
  Sparkles,
  Trophy,
  Play,
  RotateCcw,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  Target,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn, formatDuration } from "@/lib/utils"
import { startDailyChallenge } from "@/actions/practice-actions"
import { toast } from "sonner"

interface DailyChallengeData {
  challenge: {
    id: string
    challengeDate: Date
    templateId: string
    questionCount: number
    totalParticipants: number
    averageScore: number | null
    template: {
      id: string
      name: string
      description: string | null
      assessmentType: string
    } | null
  } | null
  userAttempts: {
    id: string
    score: number
    timeMs: number
    questionsCorrect: number
    completedAt: Date
    sessionId: string | null
  }[]
  bestAttempt: {
    id: string
    score: number
    timeMs: number
    questionsCorrect: number
    completedAt: Date
  } | null
  leaderboard: {
    rank: number
    userId: string
    userName: string
    userImage: string | null
    score: number
    timeMs: number
    questionsCorrect: number
    completedAt: Date
  }[]
  userRank: number | null
}

interface DailyChallengeContentProps {
  data: DailyChallengeData
  challengeDate: Date
}

export function DailyChallengeContent({ data, challengeDate }: DailyChallengeContentProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const isToday = new Date().toDateString() === new Date(challengeDate).toDateString()

  const handleStartChallenge = () => {
    if (!data.challenge) return

    startTransition(async () => {
      try {
        const result = await startDailyChallenge({
          challengeId: data.challenge!.id,
          challengeDate: new Date(challengeDate),
        })
        router.push(`/dashboard/practice/quiz/${result.sessionId}`)
      } catch (error) {
        toast.error("Failed to start challenge", {
          description: error instanceof Error ? error.message : "Unknown error",
        })
      }
    })
  }

  const handleNavigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(challengeDate)
    newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
    router.push(`/dashboard/practice/daily?date=${newDate.toISOString().split("T")[0]}`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Practice", href: "/dashboard/practice" },
          { label: "Daily Challenge", href: "/dashboard/practice/daily" },
        ]}
      />

      {/* Page Header with Date Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Daily Challenge</h1>
          <p className="text-muted-foreground">
            {isToday ? "Complete today's challenge and compete with others" : "View past challenge"}
          </p>
        </div>

        {/* Date navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleNavigateDate("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 px-3 py-2 border rounded-md">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">
              {new Date(challengeDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleNavigateDate("next")}
            disabled={isToday}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* No Challenge Available */}
      {!data.challenge && (
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-indigo-500/10" />
          <CardContent className="relative py-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <Sparkles className="h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">No Challenge Available</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  There&apos;s no challenge for this date yet.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/dashboard/practice/daily/history">
                  <Calendar className="h-4 w-4 mr-2" />
                  Browse Past Challenges
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Challenge Available */}
      {data.challenge && (
        <>
          {/* Challenge Info Card */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-indigo-500/10" />

            <CardHeader className="relative">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-pink-500" />
                    {data.challenge.template?.name || "Daily Challenge"}
                  </CardTitle>
                  {data.challenge.template?.description && (
                    <CardDescription>{data.challenge.template.description}</CardDescription>
                  )}
                </div>
                {isToday && (
                  <Badge variant="outline" className="bg-background">
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="relative space-y-4">
              {/* Challenge Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Target className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{data.challenge.questionCount}</p>
                    <p className="text-xs text-muted-foreground">Questions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Users className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{data.challenge.totalParticipants}</p>
                    <p className="text-xs text-muted-foreground">Participants</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {data.challenge.averageScore?.toFixed(0) || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">Avg Score</p>
                  </div>
                </div>
              </div>

              {/* User's Best Attempt */}
              {data.bestAttempt && (
                <div className="p-4 rounded-lg border bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium">Your Best Attempt</p>
                        <p className="text-xs text-muted-foreground">
                          {data.userAttempts.length} {data.userAttempts.length === 1 ? "attempt" : "attempts"} total
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{data.bestAttempt.score.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">
                        {data.bestAttempt.questionsCorrect}/{data.challenge.questionCount} correct
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  onClick={handleStartChallenge}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>Processing...</>
                  ) : data.userAttempts.length > 0 ? (
                    <>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Try Again
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Challenge
                    </>
                  )}
                </Button>
                {data.userAttempts.length > 0 && (
                  <Button variant="outline" asChild>
                    <Link href={`/dashboard/practice/quiz/results/${data.userAttempts[0].sessionId}`}>
                      View Last Result
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard - Emphasizing Participation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Leaderboard
              </CardTitle>
              <CardDescription>
                Everyone who participates is a winner! Keep practicing to improve.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.leaderboard.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No one has completed this challenge yet. Be the first!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.leaderboard.map((entry) => {
                    const isCurrentUser = entry.rank === data.userRank
                    return (
                      <div
                        key={entry.userId}
                        className={cn(
                          "flex items-center gap-4 p-3 rounded-lg border transition-colors",
                          isCurrentUser && "bg-primary/5 border-primary/20"
                        )}
                      >
                        {/* Rank Badge */}
                        <div
                          className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm",
                            entry.rank === 1 && "bg-yellow-500/20 text-yellow-700",
                            entry.rank === 2 && "bg-gray-400/20 text-gray-700",
                            entry.rank === 3 && "bg-orange-500/20 text-orange-700",
                            entry.rank > 3 && "bg-muted text-muted-foreground"
                          )}
                        >
                          {entry.rank}
                        </div>

                        {/* User Avatar */}
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={entry.userImage || undefined} />
                          <AvatarFallback>
                            {entry.userName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {entry.userName}
                            {isCurrentUser && (
                              <Badge variant="outline" className="ml-2">You</Badge>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.questionsCorrect}/{data.challenge!.questionCount} correct
                          </p>
                        </div>

                        {/* Score & Time */}
                        <div className="text-right">
                          <p className="text-lg font-bold">{entry.score.toFixed(0)}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(entry.timeMs)}
                          </p>
                        </div>

                        {/* Participation Badge */}
                        {entry.rank > 3 && (
                          <div className="text-xs text-muted-foreground">
                            <Award className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* User's rank if not in top 10 */}
              {data.userRank && data.userRank > 10 && (
                <div className="mt-4 p-3 rounded-lg border bg-muted/50">
                  <p className="text-sm text-center">
                    Your rank: <span className="font-bold">#{data.userRank}</span> out of{" "}
                    {data.challenge!.totalParticipants}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attempt History */}
          {data.userAttempts.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  Your Attempts
                </CardTitle>
                <CardDescription>
                  Track your progress across multiple attempts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.userAttempts.map((attempt, index) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant={index === 0 ? "default" : "outline"}>
                          #{data.userAttempts.length - index}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium">
                            Score: {attempt.score.toFixed(0)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(attempt.completedAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right text-xs text-muted-foreground">
                          <p>{attempt.questionsCorrect}/{data.challenge!.questionCount}</p>
                          <p>{formatDuration(attempt.timeMs)}</p>
                        </div>
                        {attempt.sessionId && (
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/practice/quiz/results/${attempt.sessionId}`}>
                              View
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
