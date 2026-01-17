import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { getSubjectWithTopics } from "@/actions/learning-actions"
import { SubjectDetailContent } from "./subject-content"

interface SubjectDetailPageProps {
  params: Promise<{ subjectId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SubjectDetailPage({ params, searchParams }: SubjectDetailPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return redirect("/sign-in")
  }

  const { subjectId } = await params
  const { grade } = await searchParams
  const gradeNum = grade ? parseInt(grade as string) : undefined
  const data = await getSubjectWithTopics(subjectId, gradeNum)

  if (!data) {
    notFound()
  }

  return <SubjectDetailContent data={data} />
}
