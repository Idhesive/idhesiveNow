import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getAssessmentHistory } from "@/actions/practice-actions"
import { HistoryContent } from "./history-content"

interface HistoryPageProps {
  searchParams: Promise<{
    page?: string
    type?: string
    status?: string
  }>
}

export const metadata = {
  title: "Practice History | Idhesive",
  description: "View your practice and assessment history",
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return redirect("/sign-in")
  }

  const params = await searchParams
  const page = params.page ? parseInt(params.page, 10) : 0

  const data = await getAssessmentHistory({
    page,
    limit: 20,
  })

  return <HistoryContent data={data} currentPage={page} />
}
