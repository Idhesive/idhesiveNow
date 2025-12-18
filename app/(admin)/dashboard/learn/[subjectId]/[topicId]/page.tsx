import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { getTopicDetails, startTopic } from "@/actions/learning-actions"
import { TopicLearnContent } from "./topic-content"

interface TopicLearnPageProps {
  params: Promise<{ subjectId: string; topicId: string }>
}

export default async function TopicLearnPage({ params }: TopicLearnPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return redirect("/sign-in")
  }

  const { subjectId, topicId } = await params
  const data = await getTopicDetails(topicId)

  if (!data) {
    notFound()
  }

  // Track that user has started/visited this topic
  await startTopic(topicId)

  return <TopicLearnContent data={data} subjectId={subjectId} />
}
