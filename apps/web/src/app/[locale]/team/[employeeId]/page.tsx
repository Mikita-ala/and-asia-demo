import { notFound } from "next/navigation";
import { Building2Icon, MailIcon, PhoneIcon } from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { EmployeeManagement } from "@/components/employee-management";
import { EmployeePhotoForm } from "@/components/employee-photo-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { canManageEmployee, canViewEmployee, getEmployeeAccessScope } from "@/lib/employee-access";
import { employeeStatusLabels, getCurrentEmployee, getEmployeeById, getStores } from "@/lib/employees";

function initials(name: string) { return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(); }

export default async function EmployeePage({ params }: { params: Promise<{ employeeId: string }> }) {
  const { employeeId } = await params;
  const current = await getCurrentEmployee();
  const [employee, scope] = await Promise.all([getEmployeeById(employeeId), getEmployeeAccessScope(current.userId)]);
  if (!employee || !canViewEmployee(scope, current.userId, employee)) notFound();
  const canManage = canManageEmployee(scope, employee);
  const stores = canManage ? await getStores(scope.administratorOrganizationIds.length ? undefined : scope.managedRegionIds) : [];
  return <SidebarProvider><AppSidebar activeItem="team" user={current} /><SidebarInset><header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/90"><div className="flex items-center gap-2 px-4"><SidebarTrigger className="-ml-1" /><Separator orientation="vertical" className="mr-2 h-4" /><p className="text-sm font-medium">Сотрудник</p></div></header><main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-8 p-4 sm:p-8"><section className="flex flex-col gap-5 border-b pb-8 sm:flex-row sm:items-start"><Avatar className="size-24 border"><AvatarImage src={employee.image ?? undefined} alt="" /><AvatarFallback className="text-lg">{initials(employee.name)}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><p className="text-sm font-medium text-muted-foreground">Сотрудник</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{employee.name}</h1><p className="mt-2 text-muted-foreground">{employee.jobTitle || "Должность не указана"}</p><EmployeePhotoForm employeeId={employee.userId} editable={canManage || current.userId === employee.userId} /></div></section><div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]"><section className="grid gap-6"><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-xl border bg-card p-5"><MailIcon aria-hidden="true" className="size-5 text-muted-foreground" /><p className="mt-4 text-sm text-muted-foreground">Рабочий email</p><p className="mt-1 break-all font-medium">{employee.email}</p></div><div className="rounded-xl border bg-card p-5"><PhoneIcon aria-hidden="true" className="size-5 text-muted-foreground" /><p className="mt-4 text-sm text-muted-foreground">Телефон</p><p className="mt-1 font-medium">{employee.phone || "Не указан"}</p></div></div>{canManage ? <EmployeeManagement employee={employee} stores={stores} /> : null}</section><aside className="h-fit border-y py-5 xl:sticky xl:top-8 xl:border-y-0 xl:border-l xl:pl-6"><div className="flex items-center gap-2"><Building2Icon aria-hidden="true" className="size-5" /><h2 className="font-semibold">Магазины</h2></div><div className="mt-5 space-y-3">{employee.stores.length ? employee.stores.map((store) => <div className="border-b pb-3" key={`${store.id}-${store.role}`}><p className="font-medium">{store.name}</p><p className="mt-1 text-sm text-muted-foreground">{store.regionName}</p></div>) : <p className="text-sm leading-6 text-muted-foreground">Магазины пока не назначены.</p>}</div><p className="mt-6 text-sm text-muted-foreground">{employeeStatusLabels[employee.status]}</p></aside></div></main></SidebarInset></SidebarProvider>;
}
