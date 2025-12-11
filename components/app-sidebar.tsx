"use client"

import Link from "next/link"
import { LayoutDashboard, FlaskConical } from "lucide-react"
import {
   Sidebar,
   SidebarContent,
   SidebarFooter,
   SidebarHeader,
   SidebarMenu,
   SidebarMenuItem,
   SidebarMenuButton,
   SidebarRail,
} from "@/components/ui/sidebar"
import SignOutForm from "./sign-out-form"
import Logo from "./logo"
import { usePathname } from "next/navigation"

export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
   const pathname = usePathname();
   const isDashboardActive = pathname === "/dashboard"
   const isQtiDemoActive = pathname.startsWith("/qti-demo")
   return (
      <Sidebar collapsible="offcanvas" {...props}>
         <SidebarHeader className="flex items-center">
            <Logo />
         </SidebarHeader>
         <SidebarContent>
            <SidebarMenu className="px-2 py-4">
               <SidebarMenuItem>
                  <SidebarMenuButton isActive={isDashboardActive} size="lg">
                     <Link href="/dashboard" className={`${isDashboardActive ? "text-foreground" : "text-primary"} flex items-center gap-3`}>
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                           <LayoutDashboard className="h-5 w-5" />
                        </div>
                        <span className={`text-sm font-medium`}>Dashboard</span>
                     </Link>
                  </SidebarMenuButton>
               </SidebarMenuItem>
               <SidebarMenuItem>
                  <SidebarMenuButton isActive={isQtiDemoActive} size="lg">
                     <Link href="/qti-demo" className={`${isQtiDemoActive ? "text-foreground" : "text-primary"} flex items-center gap-3`}>
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                           <FlaskConical className="h-5 w-5" />
                        </div>
                        <span className={`text-sm font-medium`}>QTI Demo</span>
                     </Link>
                  </SidebarMenuButton>
               </SidebarMenuItem>
            </SidebarMenu>
         </SidebarContent>
         <SidebarFooter>
            <SignOutForm />
         </SidebarFooter>
         <SidebarRail />
      </Sidebar>
   )
}
