"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Home,
  Users,
  Settings,
  PieChart,
  TrendingUp,
  Database,
  Shield,
  FileText,
  Bell,
  UserPlus,
  Contact
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// Navigation data
const data = {
  navMain: [
    {
      title: "Dashboard",
      items: [
        {
          title: "Overview",
          url: "/dashboard",
          icon: Home,
        },
        {
          title: "Analytics",
          url: "/dashboard/analytics",
          icon: BarChart3,
        },
        {
          title: "Reports",
          url: "/dashboard/reports",
          icon: FileText,
        },
      ],
    },
    {
      title: "Prospects",
      items: [
        {
          title: "Créer un prospect",
          url: "/dashboard/prospects/create",
          icon: UserPlus,
        },
        {
          title: "Liste des prospects",
          url: "/dashboard/prospects",
          icon: Contact,
        },
      ],
    },
    {
      title: "Management",
      items: [
        {
          title: "Users",
          url: "/dashboard/users",
          icon: Users,
        },
        {
          title: "Data Sources",
          url: "/dashboard/data-sources",
          icon: Database,
        },
        {
          title: "Notifications",
          url: "/dashboard/notifications",
          icon: Bell,
        },
      ],
    },
    {
      title: "Insights",
      items: [
        {
          title: "Performance",
          url: "/dashboard/performance",
          icon: TrendingUp,
        },
        {
          title: "Statistics",
          url: "/dashboard/statistics",
          icon: PieChart,
        },
      ],
    },
    {
      title: "Administration",
      items: [
        {
          title: "Security",
          url: "/dashboard/security",
          icon: Shield,
        },
        {
          title: "Settings",
          url: "/dashboard/settings",
          icon: Settings,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <BarChart3 className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold">Sooatek</span>
            <span className="text-xs">Dashboard</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.url

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url}>
                          <Icon className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}