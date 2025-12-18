import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getDailyChallengeData } from "@/actions/practice-actions"
import { DailyChallengeContent } from "./daily-content"

export const metadata = {
  title: "Daily Challenge | Idhesive",
  description: "Complete today's daily challenge and compete with others",
}

interface PageProps {
  searchParams: Promise<{
    date?: string
  }>
}

export default async function DailyChallengePage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return redirect("/sign-in")
  }

  const params = await searchParams

  // Parse date from query param or use today's date (user's local time)
  let challengeDate: Date
  if (params.date) {
    challengeDate = new Date(params.date)
    if (isNaN(challengeDate.getTime())) {
      challengeDate = new Date()
    }
  } else {
    challengeDate = new Date()
  }

  // Normalize to start of day
  challengeDate.setHours(0, 0, 0, 0)

  const data = await getDailyChallengeData(challengeDate)

  return (
    <DailyChallengeContent
      data={data}
      challengeDate={challengeDate}
    />
  )
}
