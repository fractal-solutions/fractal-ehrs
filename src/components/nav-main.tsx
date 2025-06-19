"use client"

import { Link, useLocation } from "react-router-dom"
import { type LucideIcon } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
  }[]
}) {
  const location = useLocation()

  return (
    <SidebarMenu>
      {items.map((item) => {
        // Use pathname match for active state
        const isActive =
          item.url !== "#" &&
          (location.pathname === item.url ||
            (item.url !== "/" && location.pathname.startsWith(item.url)))
        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={isActive}>
              <Link to={item.url}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
