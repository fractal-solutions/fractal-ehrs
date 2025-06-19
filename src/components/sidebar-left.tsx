"use client"

import * as React from "react"
import {
  AudioWaveform,
  Blocks,
  Calendar,
  Command,
  Home,
  Inbox,
  MessageCircleQuestion,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  ListChecks,
  Banknote,
  User2,
} from "lucide-react"

import { NavFavorites } from "@/components/nav-favorites"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavWorkspaces } from "@/components/nav-workspaces"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  teams: [
    {
      name: "Bethany Dental Clinic",
      logo: Command,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
    {
      title: "Ask AI",
      url: "#",
      icon: Sparkles,
    },
    {
      title: "Home",
      url: "/",
      icon: Home,
      isActive: true,
    },
    {
      title: "Appointments",
      url: "/appointments",
      icon: Calendar,
      badge: "10",
    },
    {
      title: "Patients",
      url: "/patients",
      icon: User2,
    },
    {
      title: "Billing",
      url: "/billing",
      icon: Banknote,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: ListChecks,
    },
  ],
  navSecondary: [
    {
      title: "Appointments",
      url: "#",
      icon: Calendar,
    },
    {
      title: "Clinic Settings",
      url: "#",
      icon: Settings2,
    },
    {
      title: "Patient Records",
      url: "#",
      icon: Blocks,
    },
    {
      title: "Archive",
      url: "#",
      icon: Trash2,
    },
    {
      title: "Support",
      url: "#",
      icon: MessageCircleQuestion,
    },
  ],
  favorites: [
    {
      name: "Dental Procedures & Treatment Plans",
      url: "#",
      emoji: "🦷",
    },
    {
      name: "Oral Hygiene Tips & Guidelines",
      url: "#",
      emoji: "👨‍⚕️",
    },
    {
      name: "Patient Communication & Follow-ups",
      url: "#",
      emoji: "📞",
    },
    {
      name: "Clinic Inventory & Supplies Management",
      url: "#",
      emoji: "📦",
    },
    {
      name: "Continuing Education & Training",
      url: "#",
      emoji: "🎓",
    },
    {
      name: "Dental Industry News & Updates",
      url: "#",
      emoji: "📰",
    },
    {
      name: "Financial Planning & Insurance Details",
      url: "#",
      emoji: "💼",
    },
    {
      name: "Equipment Maintenance & Scheduling",
      url: "#",
      emoji: "🔧",
    },
    {
      name: "Patient Reviews & Feedback Collection",
      url: "#",
      emoji: "📝",
    },
    {
      name: "Daily Goals & Clinic Metrics",
      url: "#",
      emoji: "📊",
    },
  ],
  workspaces: [
    {
      name: "Patient Care",
      emoji: "👨‍⚕️",
      pages: [
        {
          name: "Patient Appointments & Scheduling",
          url: "#",
          emoji: "📅",
        },
        {
          name: "Treatment Plans & Progress",
          url: "#",
          emoji: "📈",
        },
        {
          name: "Patient Education & Resources",
          url: "#",
          emoji: "📚",
        },
      ],
    },
    {
      name: "Clinic Administration",
      emoji: "🏢",
      pages: [
        {
          name: "Staff Schedules & Rosters",
          url: "#",
          emoji: "📋",
        },
        {
          name: "Billing & Invoicing",
          url: "#",
          emoji: "💳",
        },
        {
          name: "Policy & Procedure Manuals",
          url: "#",
          emoji: "📘",
        },
      ],
    },
    {
      name: "Professional Development",
      emoji: "🚀",
      pages: [
        {
          name: "Dental Conferences & Workshops",
          url: "#",
          emoji: "🗓️",
        },
        {
          name: "Networking Events & Opportunities",
          url: "#",
          emoji: "🤝",
        },
        {
          name: "Skill Enhancement & Certifications",
          url: "#",
          emoji: "🏅",
        },
      ],
    },
    {
      name: "Clinic Operations",
      emoji: "🛠️",
      pages: [
        {
          name: "Equipment Maintenance Logs",
          url: "#",
          emoji: "🔍",
        },
        {
          name: "Supply Orders & Inventory Management",
          url: "#",
          emoji: "📊",
        },
        {
          name: "Safety Protocols & Compliance",
          url: "#",
          emoji: "🛡️",
        },
      ],
    },
    {
      name: "Patient Engagement",
      emoji: "💬",
      pages: [
        {
          name: "Marketing Campaigns & Outreach",
          url: "#",
          emoji: "📢",
        },
        {
          name: "Community Events & Health Fairs",
          url: "#",
          emoji: "🎉",
        },
        {
          name: "Social Media & Online Presence",
          url: "#",
          emoji: "🌐",
        },
      ],
    },
  ],
}

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <SidebarContent>
        <NavFavorites favorites={data.favorites} />
        <NavWorkspaces workspaces={data.workspaces} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
