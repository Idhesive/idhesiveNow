import { redirect, notFound } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getSessionResults } from "@/actions/practice-actions"
import { QuizResultsContent } from "./quiz-results-content"

interface QuizResultsPageProps {
  params: Promise<{
    sessionId: string
  }>
}

export const metadata = {
  title: "Quiz Results | Idhesive",
  description: "View your quiz results and performance",
}

export default async function QuizResultsPage({ params }: QuizResultsPageProps) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return redirect("/sign-in")
  }

  const { sessionId } = await params
  const results = await getSessionResults(sessionId)

  if (!results) {
    notFound()
  }

  return <QuizResultsContent results={results} />
}
