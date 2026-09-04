import { AppSidebar } from "@/components/app-sidebar";
import { EmployeeCard } from "@/components/employee-card";
import { RegionalManagerForm } from "@/components/regional-manager-form";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { canViewEmployee, getEmployeeAccessScope } from "@/lib/employee-access";
import { getAllEmployees, getCurrentEmployee, getRegions } from "@/lib/employees";

export default async function TeamPage() {
  const current = await getCurrentEmployee();
  const [scope, allEmployees] = await Promise.all([getEmployeeAccessScope(current.userId), getAllEmployees()]);
  const employees = allEmployees.filter((employee) => canViewEmployee(scope, current.userId, employee));
  const isAdministrator = scope.administratorOrganizationIds.length > 0;
  const regions = isAdministrator ? await getRegions(scope.administratorOrganizationIds) : [];

  return (
    <SidebarProvider>
      <AppSidebar activeItem="team" user={current} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/90"><div className="flex items-center gap-2 px-4"><SidebarTrigger className="-ml-1" /><Separator orientation="vertical" className="mr-2 h-4" /><p className="text-sm font-medium">Команда</p></div></header>
        <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-8 p-4 sm:p-8">
          <section className="border-b pb-7"><p className="text-sm font-medium text-muted-foreground">Состав команды</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Сотрудники</h1><p className="mt-3 max-w-xl leading-7 text-muted-foreground">Люди, с которыми вы работаете каждый день.</p></section>
          {isAdministrator ? <section className="grid gap-4 border-b pb-8"><div><h2 className="font-semibold">Региональные менеджеры</h2><p className="mt-1 text-sm text-muted-foreground">Назначьте ответственного за регион.</p></div><RegionalManagerForm employees={allEmployees} regions={regions} /></section> : null}
          {employees.length ? <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{employees.map((employee) => <EmployeeCard key={employee.userId} employee={employee} />)}</section> : <p className="border-y py-6 text-sm text-muted-foreground">Сотрудники появятся здесь после назначения магазина.</p>}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
