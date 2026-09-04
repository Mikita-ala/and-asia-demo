import Link from "next/link"

import { requireActiveEmployee } from "@/lib/session"
import { getCurrentEmployee } from "@/lib/employees"
import { AppSidebar } from "@/components/app-sidebar"
import { ArrowRightIcon, CheckCircle2Icon, MapPinIcon, UsersRoundIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default async function Page() {
  await requireActiveEmployee()
  const employee = await getCurrentEmployee()
  return (
    <SidebarProvider>
      <AppSidebar activeItem="work" user={employee} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/90 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <p className="text-sm font-medium">Рабочее пространство</p>
          </div>
        </header>
        <main data-dashboard-content className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-8 p-4 sm:p-8">
          <section className="grid gap-6 border-b pb-7 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Сегодня</p>
              <h1 className="mt-2 max-w-xl text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Ваш день под контролем</h1>
              <p className="mt-3 max-w-xl text-pretty leading-7 text-muted-foreground">Начните со следующего шага — команда и магазин будут рядом, когда понадобятся.</p>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-muted/70 p-4">
              <MapPinIcon aria-hidden="true" className="size-5" />
              <div><p className="font-semibold">Демо-магазин</p><p className="text-sm text-muted-foreground">Алматы</p></div>
            </div>
          </section>
          <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="divide-y rounded-xl border bg-card px-4 sm:px-6">
              <div className="flex items-center justify-between gap-4 py-5"><div><h2 className="text-lg font-semibold tracking-tight">План на смену</h2><p className="mt-1 text-sm text-muted-foreground">Главное на сегодня</p></div><span className="text-sm text-muted-foreground">3 задачи</span></div>
              {[
                ["Сейчас", "Проверьте готовность магазина к открытию", "Команда и зал"],
                ["Далее", "Подготовьте выкладку и ценники", "Торговый зал"],
                ["Сегодня", "Подведите итоги и передайте смену", "До закрытия"],
              ].map(([time, title, detail]) => <div className="group flex min-h-20 items-center gap-4 py-4" key={title}><CheckCircle2Icon aria-hidden="true" className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" /><p className="w-14 shrink-0 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{time}</p><div className="min-w-0 flex-1"><p className="font-medium">{title}</p><p className="mt-1 text-sm text-muted-foreground">{detail}</p></div><ArrowRightIcon aria-hidden="true" className="size-4 text-muted-foreground" /></div>)}
              <a href="#" className="flex min-h-12 items-center gap-2 py-3 text-sm font-medium hover:underline">Все задачи <ArrowRightIcon aria-hidden="true" className="size-4" /></a>
            </div>
            <aside className="grid content-start gap-6">
              <section><div className="flex items-center gap-2"><UsersRoundIcon aria-hidden="true" className="size-5" /><h2 className="font-semibold">Команда сегодня</h2></div><div className="mt-4 divide-y border-y">{["Айжан К. · на смене", "Марат С. · на смене", "Сания К. · на связи"].map((item) => <p className="py-3 text-sm" key={item}>{item}</p>)}</div></section>
              <section className="border-t pt-5"><h2 className="font-semibold">Быстрый доступ</h2><div className="mt-3 grid gap-1"><Link className="flex min-h-11 items-center justify-between text-sm hover:underline" href="/ru/team">Сотрудники <ArrowRightIcon className="size-4" /></Link><Link className="flex min-h-11 items-center justify-between text-sm hover:underline" href="/ru/docs">База знаний <ArrowRightIcon className="size-4" /></Link></div></section>
            </aside>
          </section>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
