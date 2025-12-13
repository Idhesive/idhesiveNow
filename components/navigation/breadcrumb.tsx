"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  homeHref?: string
  showHome?: boolean
  className?: string
}

export function Breadcrumb({
  items,
  homeHref = "/dashboard",
  showHome = true,
  className,
}: BreadcrumbProps) {
  const pathname = usePathname()

  // Auto-generate breadcrumbs from pathname if items not provided
  const breadcrumbItems = items || generateBreadcrumbs(pathname, homeHref)

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1 text-sm", className)}
    >
      {showHome && (
        <>
          <Link
            href={homeHref}
            className="flex items-center text-muted-foreground transition-colors hover:text-foreground"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
          {breadcrumbItems.length > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </>
      )}
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1
        return (
          <div key={item.href} className="flex items-center gap-1">
            {isLast ? (
              <span className="font-medium text-foreground">{item.label}</span>
            ) : (
              <>
                <Link
                  href={item.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </>
            )}
          </div>
        )
      })}
    </nav>
  )
}

function generateBreadcrumbs(pathname: string, homeHref: string): BreadcrumbItem[] {
  // Remove the home path prefix
  const relativePath = pathname.replace(homeHref, "").replace(/^\//, "")

  if (!relativePath) return []

  const segments = relativePath.split("/").filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []

  let currentPath = homeHref

  for (const segment of segments) {
    // Skip dynamic segments (e.g., [id])
    if (segment.startsWith("[") && segment.endsWith("]")) {
      currentPath += `/${segment}`
      continue
    }

    currentPath += `/${segment}`

    // Format the label (capitalize and replace hyphens)
    const label = formatSegmentLabel(segment)

    breadcrumbs.push({
      label,
      href: currentPath,
    })
  }

  return breadcrumbs
}

function formatSegmentLabel(segment: string): string {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// Route label mappings for better display names
const routeLabels: Record<string, string> = {
  learn: "Learn",
  practice: "Practice",
  progress: "Progress",
  achievements: "Achievements",
  profile: "Profile",
  settings: "Settings",
  subjects: "Subjects",
  topics: "Topics",
  paths: "Learning Paths",
  quiz: "Quiz",
  daily: "Daily Challenge",
  history: "History",
  badges: "Badges",
  leaderboard: "Leaderboard",
  customize: "Customize",
  streak: "Streak",
  account: "Account",
  notifications: "Notifications",
  preferences: "Preferences",
  analytics: "Analytics",
}

export function getBreadcrumbLabel(segment: string): string {
  return routeLabels[segment] || formatSegmentLabel(segment)
}
