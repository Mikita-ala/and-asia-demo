"use client"

import Link from "next/link"
import { ArrowLeftIcon, BookOpenIcon, FolderIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

export type DocumentationCatalog = {
  title: string
  articles: { title: string; url: string; isActive: boolean }[]
}[]

function CatalogShortcut() {
  const { state, toggleSidebar } = useSidebar()

  return (
    <SidebarMenu className="hidden group-data-[collapsible=icon]:flex">
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip="Открыть каталог"
          render={<Link href="/ru/dashboard/docs" />}
          onClick={(event) => {
            if (state === "collapsed") {
              event.preventDefault()
              toggleSidebar()
            }
          }}
        >
          <BookOpenIcon aria-hidden="true" />
          <span>Каталог</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function NavDocumentation({
  catalog,
}: {
  catalog: DocumentationCatalog
}) {
  return (
    <>
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="В рабочую область"
              className="h-11 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground active:bg-sidebar-primary/85"
              render={<Link href="/ru/dashboard" />}
            >
              <ArrowLeftIcon aria-hidden="true" />
              <span>В рабочую область</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup className="pt-0">
        <SidebarGroupLabel>Каталог</SidebarGroupLabel>
        <CatalogShortcut />
        <div className="space-y-4 px-2 pt-2 group-data-[collapsible=icon]:hidden">
          {catalog.map((section) => (
            <section key={section.title} aria-label={section.title}>
              <p className="flex items-center gap-2 px-2 pb-1 text-xs font-medium text-sidebar-foreground/60">
                <FolderIcon aria-hidden="true" className="size-3.5" />
                {section.title}
              </p>
              <SidebarMenuSub className="m-0 translate-x-0 px-2">
                {section.articles.map((article) => (
                  <SidebarMenuSubItem key={article.url}>
                    <SidebarMenuSubButton
                      isActive={article.isActive}
                      className="h-9"
                      render={<Link href={article.url} />}
                    >
                      <span>{article.title}</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </section>
          ))}
        </div>
      </SidebarGroup>
    </>
  )
}
