"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface PracticeErrorDisplayProps {
  error: string
  details?: string
}

export function PracticeErrorDisplay({ error, details }: PracticeErrorDisplayProps) {
  const router = useRouter()

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case "no-questions":
        return "No questions available for the selected practice mode"
      case "session-failed":
        return "Failed to create practice session"
      case "unauthorized":
        return "You must be signed in to practice"
      default:
        return "An error occurred"
    }
  }

  const handleDismiss = () => {
    // Clear the error from URL
    router.replace("/dashboard/practice")
  }

  return (
    <Alert variant="destructive" className="mb-4 relative">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Practice Error</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{getErrorMessage(error)}</p>
        {details && (
          <p className="text-xs opacity-80">Details: {decodeURIComponent(details)}</p>
        )}
      </AlertDescription>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  )
}
