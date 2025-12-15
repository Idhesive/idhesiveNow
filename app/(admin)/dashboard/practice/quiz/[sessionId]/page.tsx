import { redirect, notFound } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getAssessmentSession } from "@/actions/practice-actions"
import { QuizSessionContent } from "./quiz-session-content"

interface QuizSessionPageProps {
  params: Promise<{
    sessionId: string
  }>
}

export const metadata = {
  title: "Quiz Session | Idhesive",
  description: "Answer questions and practice your skills",
}

export default async function QuizSessionPage({ params }: QuizSessionPageProps) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return redirect("/sign-in")
  }

  const { sessionId } = await params
  const data = await getAssessmentSession(sessionId)

  if (!data) {
    notFound()
  }

  // If session is already completed, redirect to results
  if (data.status === "COMPLETED" || data.status === "ABANDONED" || data.status === "TIMED_OUT") {
    return redirect(`/dashboard/practice/quiz/results/${sessionId}`)
  }

  return <QuizSessionContent session={data} />
}
