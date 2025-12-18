import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { getSubjectWithTopics } from "@/actions/learning-actions"
import { SubjectDetailContent } from "./subject-content"

interface SubjectDetailPageProps {
  params: Promise<{ subjectId: string }>
}

export default async function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return redirect("/sign-in")
  }

  const { subjectId } = await params
  const data = await getSubjectWithTopics(subjectId)

  if (!data) {
    notFound()
  }

  return <SubjectDetailContent data={data} />
}
