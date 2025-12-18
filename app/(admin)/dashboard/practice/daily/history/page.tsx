import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getPastChallenges } from "@/actions/practice-actions"
import { ChallengeHistoryContent } from "./history-content"

export const metadata = {
  title: "Challenge History | Idhesive",
  description: "Browse and replay past daily challenges",
}

interface PageProps {
  searchParams: Promise<{
    page?: string
  }>
}

export default async function ChallengeHistoryPage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return redirect("/sign-in")
  }

  const params = await searchParams
  const page = params.page ? parseInt(params.page, 10) : 0

  const data = await getPastChallenges({ page, limit: 20 })

  return <ChallengeHistoryContent data={data} currentPage={page} />
}
