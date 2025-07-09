"use client"

import { Link, useLocation } from "react-router-dom"
import { type LucideIcon } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    children?: {
      title: string
      url: string
      icon: LucideIcon
    }[]
  }[],
}) {
  const location = useLocation()

  return (
    <SidebarMenu>
      {items.map((item) => {
        const isActive =
          item.url !== "#" &&
          (location.pathname === item.url ||
            (item.url !== "/" && location.pathname.startsWith(item.url)))

        if (item.children) {
          return (
            <Collapsible key={item.title} defaultOpen={isActive}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>
              <CollapsibleContent className="ml-4">
                <SidebarMenu>
                  {item.children.map((child) => (
                    <SidebarMenuItem key={child.title}>
                      <SidebarMenuButton asChild isActive={location.pathname === child.url}>
                        <Link to={child.url}>
                          <child.icon />
                          <span>{child.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>
          );
        }

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
