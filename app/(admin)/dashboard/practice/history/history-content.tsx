"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Breadcrumb } from "@/components/navigation/breadcrumb"
import { SessionList } from "@/components/practice"
import type { SessionCardProps } from "@/components/practice"
import { ChevronLeft, ChevronRight, History } from "lucide-react"

interface HistoryData {
  sessions: SessionCardProps[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface HistoryContentProps {
  data: HistoryData
  currentPage: number
}

export function HistoryContent({ data, currentPage }: HistoryContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", newPage.toString())
    router.push(`/dashboard/practice/history?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: "Practice", href: "/dashboard/practice" },
          { label: "History", href: "/dashboard/practice/history" },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Practice History</h1>
        <p className="text-muted-foreground">
          View all your past practice sessions and assessments.
        </p>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-5 w-5" />
            Session Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-2xl font-bold">{data.total}</p>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
            </div>
            <div className="h-12 border-l" />
            <div>
              <p className="text-2xl font-bold">
                {Math.round(
                  data.sessions.reduce((acc, s) => {
                    const accuracy = s.questionsAttempted > 0
                      ? (s.questionsCorrect / s.questionsAttempted) * 100
                      : 0
                    return acc + accuracy
                  }, 0) / Math.max(data.sessions.length, 1)
                )}%
              </p>
              <p className="text-sm text-muted-foreground">Avg. Accuracy (this page)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <SessionList
        sessions={data.sessions}
        emptyMessage="No practice history yet. Start practicing to see your sessions here!"
      />

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {data.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= data.totalPages - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
