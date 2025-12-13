"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Trophy,
  User,
  Settings,
  ChevronDown,
  Flame,
  Target,
  History,
  BarChart3,
  Medal,
  Award,
  Crown,
  Palette,
  Bell,
  Sliders,
  FlaskConical,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import SignOutForm from "./sign-out-form"
import Logo from "./logo"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  badge?: string | number
  children?: {
    title: string
    href: string
    icon?: React.ElementType
  }[]
}

const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Learn",
    href: "/dashboard/learn",
    icon: BookOpen,
    children: [
      { title: "Browse Subjects", href: "/dashboard/learn/subjects" },
      { title: "Learning Paths", href: "/dashboard/learn/paths" },
    ],
  },
  {
    title: "Practice",
    href: "/dashboard/practice",
    icon: GraduationCap,
    children: [
      { title: "Quick Practice", href: "/dashboard/practice" },
      { title: "Daily Challenge", href: "/dashboard/practice/daily", icon: Target },
      { title: "History", href: "/dashboard/practice/history", icon: History },
    ],
  },
  {
    title: "Progress",
    href: "/dashboard/progress",
    icon: BarChart3,
    children: [
      { title: "Overview", href: "/dashboard/progress" },
      { title: "Analytics", href: "/dashboard/progress/analytics" },
    ],
  },
  {
    title: "Achievements",
    href: "/dashboard/achievements",
    icon: Trophy,
    children: [
      { title: "Overview", href: "/dashboard/achievements" },
      { title: "Badges", href: "/dashboard/achievements/badges", icon: Medal },
      { title: "Achievements", href: "/dashboard/achievements/achievements", icon: Award },
      { title: "Leaderboard", href: "/dashboard/achievements/leaderboard", icon: Crown },
    ],
  },
]

const userNavItems: NavItem[] = [
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
    children: [
      { title: "Overview", href: "/dashboard/profile" },
      { title: "Customize", href: "/dashboard/profile/customize", icon: Palette },
      { title: "Streak", href: "/dashboard/profile/streak", icon: Flame },
    ],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    children: [
      { title: "General", href: "/dashboard/settings" },
      { title: "Account", href: "/dashboard/settings/account", icon: User },
      { title: "Notifications", href: "/dashboard/settings/notifications", icon: Bell },
      { title: "Preferences", href: "/dashboard/settings/preferences", icon: Sliders },
    ],
  },
]

const devNavItems: NavItem[] = [
  {
    title: "QTI Demo",
    href: "/qti-demo",
    icon: FlaskConical,
  },
]

function NavItemComponent({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const isActive = pathname === item.href
  const isParentActive = pathname.startsWith(item.href) && item.href !== "/dashboard"
  const Icon = item.icon

  if (item.children) {
    return (
      <Collapsible defaultOpen={isParentActive} className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              isActive={isActive}
              className={cn(
                "justify-between",
                isParentActive && "bg-accent"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md",
                    isParentActive ? "bg-primary text-primary-foreground" : "bg-primary/10"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="font-medium">{item.title}</span>
              </div>
              <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children.map((child) => {
                const isChildActive = pathname === child.href
                const ChildIcon = child.icon
                return (
                  <SidebarMenuSubItem key={child.href}>
                    <SidebarMenuSubButton asChild isActive={isChildActive}>
                      <Link href={child.href} className="flex items-center gap-2">
                        {ChildIcon && <ChildIcon className="h-3.5 w-3.5" />}
                        <span>{child.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )
              })}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={item.href} className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md",
              isActive ? "bg-primary text-primary-foreground" : "bg-primary/10"
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          <span className="font-medium">{item.title}</span>
          {item.badge && (
            <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
              {item.badge}
            </span>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b px-4 py-3">
        <Logo />
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <NavItemComponent key={item.href} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userNavItems.map((item) => (
                <NavItemComponent key={item.href} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Developer</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {devNavItems.map((item) => (
                <NavItemComponent key={item.href} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <SignOutForm />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
