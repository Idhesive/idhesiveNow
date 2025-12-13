import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getDashboardData } from "@/actions/dashboard-actions"
import { DashboardContent } from "./dashboard-content"

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return redirect("/sign-in")
  }

  const dashboardData = await getDashboardData()

  return (
    <DashboardContent
      user={session.user}
      data={dashboardData}
    />
  )
}
