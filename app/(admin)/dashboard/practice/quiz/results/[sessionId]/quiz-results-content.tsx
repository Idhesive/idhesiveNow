"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Breadcrumb } from "@/components/navigation/breadcrumb"
import {
  CheckCircle,
  XCircle,
  Clock,
  Flame,
  Trophy,
  RotateCcw,
  Home,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { AssessmentType, SessionStatus, QuestionType, DifficultyLevel } from "@prisma/client"

interface QuestionResult {
  position: number
  questionId: string
  title: string
  qtiXml: string
  type: QuestionType
  difficultyLevel: DifficultyLevel
  maxScore: number
  correctAnswers: unknown
  wasAnswered: boolean
  wasSkipped: boolean
  wasCorrect: boolean | null
  response: {
    response: unknown
    responseText: string | null
    isCorrect: boolean | null
    score: number | null
    maxScore: number | null
    durationMs: number | null
    hintsUsed: number
  } | null
}

interface ResultsData {
  id: string
  assessmentType: AssessmentType
  status: SessionStatus
  templateName?: string
  topicNames: string[]
  questionsAttempted: number
  questionsCorrect: number
  questionsSkipped: number
  totalScore: number
  maxPossibleScore: number
  accuracy: number
  longestStreak: number
  streakBonusEarned: number
  startedAt: Date
  endedAt: Date | null
  totalTimeMs: number | null
  terminationReason: string | null
  questions: QuestionResult[]
}

interface QuizResultsContentProps {
  results: ResultsData
}

export function QuizResultsContent({ results }: QuizResultsContentProps) {
  const [activeTab, setActiveTab] = useState("summary")

  const accuracyPercent = Math.round(results.accuracy * 100)
  const scorePercent = results.maxPossibleScore > 0
    ? Math.round((results.totalScore / results.maxPossibleScore) * 100)
    : 0

  // Calculate time spent
  const totalSeconds = results.totalTimeMs ? Math.round(results.totalTimeMs / 1000) : 0
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  // Determine performance level
  const performanceLevel = accuracyPercent >= 90 ? "excellent" :
    accuracyPercent >= 75 ? "good" :
    accuracyPercent >= 60 ? "fair" : "needs_improvement"

  const performanceMessages: Record<string, { title: string; message: string }> = {
    excellent: {
      title: "Excellent Work! 🌟",
      message: "You've demonstrated strong mastery of this material!",
    },
    good: {
      title: "Good Job! 👍",
      message: "You're doing well. Keep practicing to improve even more!",
    },
    fair: {
      title: "Nice Effort! 💪",
      message: "You're on the right track. Review the questions you missed.",
    },
    needs_improvement: {
      title: "Keep Going! 📚",
      message: "Don't give up! Review the material and try again.",
    },
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <Breadcrumb
        items={[
          { label: "Practice", href: "/dashboard/practice" },
          { label: "Results", href: `/dashboard/practice/quiz/results/${results.id}` },
        ]}
      />

      {/* Results Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Score Circle */}
            <div className={cn(
              "flex h-32 w-32 items-center justify-center rounded-full border-8",
              accuracyPercent >= 80 ? "border-green-500" :
              accuracyPercent >= 60 ? "border-yellow-500" :
              "border-red-500"
            )}>
              <div>
                <p className={cn(
                  "text-4xl font-bold",
                  accuracyPercent >= 80 ? "text-green-600" :
                  accuracyPercent >= 60 ? "text-yellow-600" :
                  "text-red-600"
                )}>
                  {accuracyPercent}%
                </p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
            </div>

            {/* Performance Message */}
            <div>
              <h2 className="text-2xl font-bold">
                {performanceMessages[performanceLevel].title}
              </h2>
              <p className="text-muted-foreground mt-1">
                {performanceMessages[performanceLevel].message}
              </p>
            </div>

            {/* Topic badges */}
            {results.topicNames.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {results.topicNames.map((name, i) => (
                  <Badge key={i} variant="secondary">{name}</Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">
              {results.questionsCorrect}/{results.questionsAttempted}
            </p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">{scorePercent}%</p>
            <p className="text-xs text-muted-foreground">
              Score ({results.totalScore}/{results.maxPossibleScore})
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="h-8 w-8 mx-auto text-orange-500 mb-2" />
            <p className="text-2xl font-bold">{results.longestStreak}</p>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </p>
            <p className="text-xs text-muted-foreground">Time Spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button asChild>
          <Link href="/dashboard/practice">
            <Home className="h-4 w-4 mr-2" />
            Back to Practice
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/practice/quiz/start?mode=quick">
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Link>
        </Button>
      </div>

      {/* Question Review */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="review">Review Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Question Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {results.questions.map((q, i) => (
                  <div
                    key={q.questionId}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium border",
                      q.wasCorrect === true
                        ? "bg-green-100 border-green-500 text-green-700"
                        : q.wasCorrect === false
                        ? "bg-red-100 border-red-500 text-red-700"
                        : q.wasSkipped
                        ? "bg-gray-100 border-gray-300 text-gray-500"
                        : "bg-gray-50 border-gray-200 text-gray-400"
                    )}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-green-100 border border-green-500" />
                  <span>Correct</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-red-100 border border-red-500" />
                  <span>Incorrect</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-gray-100 border border-gray-300" />
                  <span>Skipped</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          {results.questions.map((question, index) => (
            <QuestionReviewCard
              key={question.questionId}
              question={question}
              index={index}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface QuestionReviewCardProps {
  question: QuestionResult
  index: number
}

function QuestionReviewCard({ question, index }: QuestionReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const isCorrect = question.wasCorrect === true
  const isIncorrect = question.wasCorrect === false

  return (
    <Card className={cn(
      "border-l-4",
      isCorrect ? "border-l-green-500" :
      isIncorrect ? "border-l-red-500" :
      "border-l-gray-300"
    )}>
      <CardContent className="p-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full",
              isCorrect ? "bg-green-100" :
              isIncorrect ? "bg-red-100" :
              "bg-gray-100"
            )}>
              {isCorrect ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : isIncorrect ? (
                <XCircle className="h-5 w-5 text-red-600" />
              ) : (
                <span className="text-sm text-gray-500">—</span>
              )}
            </div>
            <div>
              <p className="font-medium">Question {index + 1}</p>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {question.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              {question.difficultyLevel}
            </Badge>
            {question.response?.durationMs && (
              <span className="text-xs text-muted-foreground">
                {Math.round(question.response.durationMs / 1000)}s
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-4">
            {/* Show user's answer */}
            {question.response != null ? (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Your Answer:
                </p>
                <p className={cn(
                  "text-sm",
                  isCorrect ? "text-green-600" : "text-red-600"
                )}>
                  {String(question.response.responseText ||
                    (typeof question.response.response === "string"
                      ? question.response.response
                      : JSON.stringify(question.response.response)))}
                </p>
              </div>
            ) : null}

            {/* Show correct answer if wrong */}
            {isIncorrect && question.correctAnswers != null ? (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Correct Answer:
                </p>
                <p className="text-sm text-green-600">
                  {String(typeof question.correctAnswers === "string"
                    ? question.correctAnswers
                    : JSON.stringify(question.correctAnswers))}
                </p>
              </div>
            ) : null}

            {/* Score info */}
            {question.response?.score !== null && question.response?.score !== undefined && (
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  Score: {question.response.score} / {question.response.maxScore || question.maxScore}
                </span>
                {question.response.hintsUsed > 0 && (
                  <span className="text-muted-foreground">
                    Hints used: {question.response.hintsUsed}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
