"use client"

import * as React from "react"
import {
  BookOpenIcon,
  ClipboardCheckIcon,
  GalleryVerticalEndIcon,
  Settings2Icon,
  UsersRoundIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavDocumentation, type DocumentationCatalog } from "@/components/nav-documentation"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "AND Asia",
    email: "",
    avatar: "",
  },
  teams: [
    {
      name: "AND Asia",
      logo: <GalleryVerticalEndIcon />,
      plan: "Рабочее пространство",
    },
  ],
  navMain: [
    {
      title: "Работа",
      url: "/ru/dashboard",
      icon: <ClipboardCheckIcon />,
      isActive: true,
    },
    {
      title: "Команда",
      url: "/ru/team",
      icon: <UsersRoundIcon />,
    },
    {
      title: "База знаний",
      url: "/ru/docs",
      icon: <BookOpenIcon />,
    },
    {
      title: "Настройки",
      url: "/ru/profile",
      icon: <Settings2Icon />,
    },
  ],
}

export function AppSidebar({
  activeItem,
  documentationCatalog,
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  activeItem?: "work" | "team" | "profile" | "documentation"
  documentationCatalog?: DocumentationCatalog
  user?: { name: string; email: string; image: string | null }
}) {
  const navMain = data.navMain.map((item) => ({
    ...item,
    isActive: activeItem
      ? (activeItem === "documentation" ? item.title === "База знаний" :
        activeItem === "work" ? item.title === "Работа" :
        activeItem === "team" ? item.title === "Команда" :
        item.title === "Настройки")
      : item.isActive,
  }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        {documentationCatalog ? (
          <NavDocumentation catalog={documentationCatalog} />
        ) : (
          <>
            <NavMain items={navMain} />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: user?.name ?? data.user.name, email: user?.email ?? data.user.email, avatar: user?.image ?? data.user.avatar }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
