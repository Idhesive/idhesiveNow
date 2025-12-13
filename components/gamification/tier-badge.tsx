import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Sprout, TreeDeciduous, Trees, TreePine } from "lucide-react"

type AcademicTier =
  | "SEED"
  | "SPROUT"
  | "SAPLING"
  | "TREE"
  | "GROVE"
  | "FOREST"
  | "ANCIENT_FOREST"

interface TierConfig {
  label: string
  description: string
  ratingRange: string
  color: string
  bgColor: string
  icon: React.ElementType
}

const tierConfigs: Record<AcademicTier, TierConfig> = {
  SEED: {
    label: "Seed",
    description: "Just starting your learning journey",
    ratingRange: "0 - 1000",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    icon: Sprout,
  },
  SPROUT: {
    label: "Sprout",
    description: "Beginning to grow your knowledge",
    ratingRange: "1000 - 1200",
    color: "text-lime-600 dark:text-lime-400",
    bgColor: "bg-lime-100 dark:bg-lime-900/30",
    icon: Sprout,
  },
  SAPLING: {
    label: "Sapling",
    description: "Developing strong foundations",
    ratingRange: "1200 - 1400",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    icon: TreeDeciduous,
  },
  TREE: {
    label: "Tree",
    description: "Solid understanding taking root",
    ratingRange: "1400 - 1600",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    icon: TreeDeciduous,
  },
  GROVE: {
    label: "Grove",
    description: "Knowledge spreading wide",
    ratingRange: "1600 - 1800",
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-100 dark:bg-teal-900/30",
    icon: Trees,
  },
  FOREST: {
    label: "Forest",
    description: "Deep mastery achieved",
    ratingRange: "1800 - 2000",
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
    icon: Trees,
  },
  ANCIENT_FOREST: {
    label: "Ancient Forest",
    description: "Legendary wisdom",
    ratingRange: "2000+",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    icon: TreePine,
  },
}

interface TierBadgeProps {
  tier: AcademicTier
  showLabel?: boolean
  showTooltip?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function TierBadge({
  tier,
  showLabel = false,
  showTooltip = true,
  size = "md",
  className,
}: TierBadgeProps) {
  const config = tierConfigs[tier]
  const Icon = config.icon

  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  const badge = (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        showLabel ? "px-2.5 py-1" : "",
        config.bgColor,
        config.color,
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full",
          !showLabel && sizeClasses[size],
          !showLabel && config.bgColor
        )}
      >
        <Icon className={iconSizes[size]} />
      </div>
      {showLabel && <span>{config.label}</span>}
    </div>
  )

  if (!showTooltip) {
    return badge
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-semibold">{config.label}</p>
            <p className="text-xs text-muted-foreground">{config.description}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Rating: {config.ratingRange}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export { tierConfigs, type AcademicTier }
