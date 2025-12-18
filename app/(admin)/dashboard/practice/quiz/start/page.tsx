import { redirect } from "next/navigation"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { startPracticeSession } from "@/actions/practice-actions"

interface StartQuizPageProps {
  searchParams: Promise<{
    mode?: string
    topic?: string
    template?: string
    count?: string
  }>
}

export default async function StartQuizPage({ searchParams }: StartQuizPageProps) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return redirect("/sign-in")
  }

  const params = await searchParams
  const mode = params.mode || "quick"
  const topicId = params.topic
  const templateId = params.template
  const questionCount = params.count ? parseInt(params.count, 10) : 5

  // Determine assessment type based on mode
  let assessmentType: "PRACTICE_SET" | "QUIZ" | "ADAPTIVE_ASSESSMENT" | "REVIEW_SESSION" = "PRACTICE_SET"

  switch (mode) {
    case "quick":
      assessmentType = "QUIZ"
      break
    case "assessment":
      assessmentType = "ADAPTIVE_ASSESSMENT"
      break
    case "review":
      assessmentType = "REVIEW_SESSION"
      break
    case "topic":
      assessmentType = "PRACTICE_SET"
      break
    default:
      assessmentType = "PRACTICE_SET"
  }

  console.log("[Quiz Start] Starting session with:", {
    mode,
    topicId,
    templateId,
    questionCount,
    assessmentType,
  })

  try {
    const result = await startPracticeSession({
      templateId,
      assessmentType,
      topicIds: topicId ? [topicId] : undefined,
      questionCount,
    })

    console.log("[Quiz Start] Session created:", result.sessionId)

    // Redirect to the quiz session
    redirect(`/dashboard/practice/quiz/${result.sessionId}`)
  } catch (error) {
    // Re-throw redirect errors - they're not actual errors
    if (isRedirectError(error)) {
      throw error
    }

    // Handle actual errors
    console.error("[Quiz Start] Failed to start practice session:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    redirect(`/dashboard/practice?error=no-questions&details=${encodeURIComponent(errorMessage)}`)
  }
}
