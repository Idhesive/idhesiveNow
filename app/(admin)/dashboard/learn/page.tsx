import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getSubjectsWithProgress, getUserLearningPaths } from "@/actions/learning-actions"
import { LearnDashboardContent } from "./learn-content"

export default async function LearnDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return redirect("/sign-in")
  }

  const [subjects, learningPaths] = await Promise.all([
    getSubjectsWithProgress(),
    getUserLearningPaths(),
  ])

  return (
    <LearnDashboardContent
      subjects={subjects}
      learningPaths={learningPaths}
    />
  )
}
