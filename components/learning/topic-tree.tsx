"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Circle,
  Lock,
  PlayCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { TopicStatus } from "./topic-card"

export interface TopicTreeNode {
  id: string
  name: string
  description?: string | null
  status: TopicStatus
  progress?: number
  masteryLevel?: number
  children?: TopicTreeNode[]
}

interface TopicTreeItemProps {
  node: TopicTreeNode
  subjectId: string
  level?: number
}

const statusIcons: Record<TopicStatus, typeof Circle> = {
  locked: Lock,
  available: Circle,
  in_progress: PlayCircle,
  completed: CheckCircle,
}

const statusColors: Record<TopicStatus, string> = {
  locked: "text-muted-foreground",
  available: "text-blue-500",
  in_progress: "text-orange-500",
  completed: "text-green-500",
}

function TopicTreeItem({ node, subjectId, level = 0 }: TopicTreeItemProps) {
  const [isOpen, setIsOpen] = useState(
    node.status === "in_progress" || level === 0
  )
  const hasChildren = node.children && node.children.length > 0
  const StatusIcon = statusIcons[node.status]
  const isLocked = node.status === "locked"

  const itemContent = (
    <div
      className={cn(
        "flex items-center gap-2 py-2 px-3 rounded-md transition-colors",
        !isLocked && "hover:bg-muted/50 cursor-pointer",
        isLocked && "opacity-60 cursor-not-allowed"
      )}
    >
      <StatusIcon className={cn("h-4 w-4 shrink-0", statusColors[node.status])} />
      <span className="flex-1 text-sm font-medium truncate">{node.name}</span>
      {node.masteryLevel !== undefined && node.masteryLevel > 0 && (
        <Badge variant="outline" className="text-xs ml-2">
          {Math.round(node.masteryLevel * 100)}%
        </Badge>
      )}
    </div>
  )

  if (!hasChildren) {
    if (isLocked) {
      return <div style={{ paddingLeft: level * 16 }}>{itemContent}</div>
    }
    return (
      <Link
        href={`/dashboard/learn/${subjectId}/${node.id}`}
        style={{ paddingLeft: level * 16 }}
        className="block"
      >
        {itemContent}
      </Link>
    )
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div style={{ paddingLeft: level * 16 }}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-1 cursor-pointer">
            <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <div className="flex-1">
              {isLocked ? (
                itemContent
              ) : (
                <Link
                  href={`/dashboard/learn/${subjectId}/${node.id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {itemContent}
                </Link>
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="ml-3 border-l border-border pl-2">
            {node.children?.map((child) => (
              <TopicTreeItem
                key={child.id}
                node={child}
                subjectId={subjectId}
                level={level + 1}
              />
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

interface TopicTreeProps {
  topics: TopicTreeNode[]
  subjectId: string
  className?: string
}

export function TopicTree({ topics, subjectId, className }: TopicTreeProps) {
  if (topics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-muted-foreground">No topics available</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-1", className)}>
      {topics.map((topic) => (
        <TopicTreeItem key={topic.id} node={topic} subjectId={subjectId} />
      ))}
    </div>
  )
}
