"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  ArrowRight,
  CheckCircle,
  XCircle,
  Flame,
  Heart,
  Pause,
  SkipForward,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { submitQuestionResponse, endPracticeSession } from "@/actions/practice-actions"
import { toast } from "sonner"
import QtiItemViewer from "@/components/qti/qti-item-viewer"
import type { AssessmentType, SessionStatus, QuestionType, DifficultyLevel } from "@prisma/client"

interface QuestionData {
  position: number
  questionId: string
  publicId: string
  qtiXml: string
  type: QuestionType
  title: string
  difficultyLevel: DifficultyLevel
  maxScore: number
  wasAnswered: boolean
  wasSkipped: boolean
  wasCorrect: boolean | null
}

interface SessionData {
  id: string
  assessmentType: AssessmentType
  status: SessionStatus
  config: unknown
  topicIds: string[]
  topicNames: string[]
  currentQuestionIndex: number
  questionsAttempted: number
  questionsCorrect: number
  totalScore: number
  maxPossibleScore: number
  currentStreak: number
  longestStreak: number
  livesRemaining: number | null
  livesUsed: number
  startedAt: Date
  endedAt: Date | null
  totalTimeMs: number | null
  template: {
    id: string
    name: string
    showFeedbackAfterEach: boolean
    showCorrectAnswer: boolean
    allowSkip: boolean
    allowHints: boolean
    perQuestionTimeLimit: number | null
    showTimer: boolean
    startingLives: number | null
  } | null
  questions: QuestionData[]
  responses: {
    id: string
    questionId: string
    isCorrect: boolean | null
    score: number | null
    submittedAt: Date | null
  }[]
}

interface QuizSessionContentProps {
  session: SessionData
}

export function QuizSessionContent({ session }: QuizSessionContentProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [currentIndex, setCurrentIndex] = useState(session.currentQuestionIndex)
  const [sessionState, setSessionState] = useState({
    questionsAttempted: session.questionsAttempted,
    questionsCorrect: session.questionsCorrect,
    currentStreak: session.currentStreak,
    longestStreak: session.longestStreak,
    livesRemaining: session.livesRemaining,
  })
  const [showFeedback, setShowFeedback] = useState(false)
  const [lastResponse, setLastResponse] = useState<{
    isCorrect: boolean
    correctAnswers: unknown
  } | null>(null)
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date())
  const [showQuitDialog, setShowQuitDialog] = useState(false)
  const [selectedResponse, setSelectedResponse] = useState<unknown>(null)

  const currentQuestion = session.questions[currentIndex]
  const totalQuestions = session.questions.length
  const progress = ((currentIndex + 1) / totalQuestions) * 100
  const allowSkip = session.template?.allowSkip ?? false
  const showFeedbackAfterEach = session.template?.showFeedbackAfterEach ?? true
  const hasLives = session.template?.startingLives !== null

  // Reset question start time when question changes
  useEffect(() => {
    setQuestionStartTime(new Date())
    setSelectedResponse(null)
    setShowFeedback(false)
    setLastResponse(null)
  }, [currentIndex])

  // Handle QTI response changes from the web component
  const handleResponseChange = (response: { identifier: string; value: string | string[] }) => {
    // Store the response value - for single choice it's usually a string like "A", "B", etc.
    // For multiple choice it's an array
    setSelectedResponse(response.value)
  }

  const handleSubmit = async () => {
    if (!currentQuestion || !selectedResponse) return

    startTransition(async () => {
      try {
        const result = await submitQuestionResponse({
          sessionId: session.id,
          questionId: currentQuestion.questionId,
          response: selectedResponse,
          startedAt: questionStartTime,
        })

        // Update local state
        setSessionState((prev) => ({
          ...prev,
          questionsAttempted: prev.questionsAttempted + 1,
          questionsCorrect: result.isCorrect ? prev.questionsCorrect + 1 : prev.questionsCorrect,
          currentStreak: result.currentStreak,
          longestStreak: result.longestStreak,
          livesRemaining: hasLives && !result.isCorrect
            ? (prev.livesRemaining ?? 0) - 1
            : prev.livesRemaining,
        }))

        setLastResponse({
          isCorrect: result.isCorrect,
          correctAnswers: result.correctAnswers,
        })

        if (showFeedbackAfterEach) {
          setShowFeedback(true)
        } else {
          // Move to next question or finish
          handleNextQuestion()
        }

        // Check if session should end (no lives left)
        if (hasLives && !result.isCorrect && (sessionState.livesRemaining ?? 0) <= 1) {
          await handleEndSession("OUT_OF_LIVES")
        }
      } catch (error) {
        console.error("Failed to submit response:", error)
        toast.error("Failed to submit answer. Please try again.")
      }
    })
  }

  const handleNextQuestion = () => {
    setShowFeedback(false)
    setLastResponse(null)

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      // Quiz complete
      handleEndSession("COMPLETED")
    }
  }

  const handleSkip = async () => {
    if (!allowSkip) return
    setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1))
  }

  const handleEndSession = async (reason: string) => {
    startTransition(async () => {
      try {
        await endPracticeSession(session.id, reason)
        router.push(`/dashboard/practice/quiz/results/${session.id}`)
      } catch (error) {
        console.error("Failed to end session:", error)
        toast.error("Failed to end session. Please try again.")
      }
    })
  }

  const handleQuit = () => {
    setShowQuitDialog(true)
  }

  const confirmQuit = async () => {
    setShowQuitDialog(false)
    await handleEndSession("USER_QUIT")
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p>Loading question...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto">
      {/* Quiz Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="secondary">
            {currentIndex + 1} / {totalQuestions}
          </Badge>
          {session.topicNames.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {session.topicNames.join(", ")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Streak */}
          {sessionState.currentStreak > 0 && (
            <div className="flex items-center gap-1 text-orange-500">
              <Flame className="h-5 w-5" />
              <span className="font-bold">{sessionState.currentStreak}</span>
            </div>
          )}

          {/* Lives */}
          {hasLives && sessionState.livesRemaining !== null && (
            <div className="flex items-center gap-1 text-red-500">
              {Array.from({ length: session.template?.startingLives || 0 }).map((_, i) => (
                <Heart
                  key={i}
                  className={cn(
                    "h-5 w-5",
                    i < sessionState.livesRemaining! ? "fill-current" : "opacity-30"
                  )}
                />
              ))}
            </div>
          )}

          <Button variant="ghost" size="sm" onClick={handleQuit}>
            <Pause className="h-4 w-4 mr-2" />
            Quit
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={progress} className="h-2" />

      {/* Question Card */}
      <Card className="min-h-[400px]">
        <CardContent className="p-6">
          {showFeedback && lastResponse ? (
            // Feedback View
            <FeedbackDisplay
              isCorrect={lastResponse.isCorrect}
              correctAnswers={lastResponse.correctAnswers}
              currentStreak={sessionState.currentStreak}
              onContinue={handleNextQuestion}
              isLastQuestion={currentIndex >= totalQuestions - 1}
            />
          ) : (
            // Question View
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge variant="outline">
                  {currentQuestion.difficultyLevel}
                </Badge>
                {currentQuestion.maxScore > 1 && (
                  <span className="text-sm text-muted-foreground">
                    {currentQuestion.maxScore} points
                  </span>
                )}
              </div>

              {/* QTI Question Renderer */}
              <div className="min-h-[250px]">
                <QtiItemViewer
                  itemXML={currentQuestion.qtiXml}
                  onItemLoaded={() => console.log("Question loaded")}
                  onResponseChange={handleResponseChange}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {!showFeedback && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {allowSkip && (
              <Button variant="ghost" onClick={handleSkip} disabled={isPending}>
                <SkipForward className="h-4 w-4 mr-2" />
                Skip
              </Button>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isPending || !selectedResponse}
          >
            {isPending ? "Submitting..." : "Submit Answer"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Quit Confirmation Dialog */}
      <AlertDialog open={showQuitDialog} onOpenChange={setShowQuitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quit Practice Session?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will be saved, but you won&apos;t be able to continue from where you left off.
              You&apos;ve answered {sessionState.questionsAttempted} questions so far.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Practice</AlertDialogCancel>
            <AlertDialogAction onClick={confirmQuit}>
              Quit & View Results
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface FeedbackDisplayProps {
  isCorrect: boolean
  correctAnswers: unknown
  currentStreak: number
  onContinue: () => void
  isLastQuestion: boolean
}

function FeedbackDisplay({
  isCorrect,
  correctAnswers,
  currentStreak,
  onContinue,
  isLastQuestion,
}: FeedbackDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center space-y-6">
      {/* Result Icon */}
      <div
        className={cn(
          "flex h-20 w-20 items-center justify-center rounded-full",
          isCorrect ? "bg-green-100" : "bg-red-100"
        )}
      >
        {isCorrect ? (
          <CheckCircle className="h-12 w-12 text-green-600" />
        ) : (
          <XCircle className="h-12 w-12 text-red-600" />
        )}
      </div>

      {/* Result Message */}
      <div>
        <h3 className={cn(
          "text-2xl font-bold",
          isCorrect ? "text-green-600" : "text-red-600"
        )}>
          {isCorrect ? "Correct!" : "Incorrect"}
        </h3>

        {isCorrect && currentStreak > 1 && (
          <div className="flex items-center justify-center gap-2 mt-2 text-orange-500">
            <Flame className="h-5 w-5" />
            <span className="font-bold">{currentStreak} streak!</span>
          </div>
        )}
      </div>

      {/* Correct Answer (if wrong) */}
      {!isCorrect && correctAnswers != null ? (
        <div className="text-sm text-muted-foreground">
          <p>The correct answer was:</p>
          <p className="font-medium text-foreground mt-1">
            {String(typeof correctAnswers === "string"
              ? correctAnswers
              : JSON.stringify(correctAnswers))}
          </p>
        </div>
      ) : null}

      {/* Continue Button */}
      <Button onClick={onContinue} size="lg">
        {isLastQuestion ? "View Results" : "Next Question"}
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  )
}
