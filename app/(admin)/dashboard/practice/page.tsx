import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getPracticeDashboardData } from "@/actions/practice-actions"
import { PracticeDashboardContent } from "./practice-content"
import { PracticeErrorDisplay } from "./practice-error-display"

export const metadata = {
  title: "Practice | Idhesive",
  description: "Practice and improve your skills",
}

interface PageProps {
  searchParams: Promise<{
    error?: string
    details?: string
  }>
}

export default async function PracticeDashboardPage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return redirect("/sign-in")
  }

  const params = await searchParams
  const data = await getPracticeDashboardData()

  return (
    <>
      {params.error && (
        <PracticeErrorDisplay error={params.error} details={params.details} />
      )}
      <PracticeDashboardContent data={data} />
    </>
  )
}
