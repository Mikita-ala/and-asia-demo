import { updateMyProfile } from "@/app/actions/employees";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeePhotoForm } from "@/components/employee-photo-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getCurrentEmployee, getEmployeeById, employeeStatusLabels } from "@/lib/employees";

export default async function ProfilePage() {
  const employee = await getCurrentEmployee();
  const employeeDetails = await getEmployeeById(employee.userId);
  const initials = employee.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <SidebarProvider>
      <AppSidebar activeItem="profile" user={employee} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/90">
          <div className="flex items-center gap-2 px-4"><SidebarTrigger className="-ml-1" /><Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" /><p className="text-sm font-medium">Профиль</p></div>
        </header>
        <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-8 p-4 sm:p-8">
          <section className="border-b pb-7">
            <p className="text-sm font-medium text-muted-foreground">Личные данные</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Ваш профиль</h1>
            <p className="mt-3 max-w-xl leading-7 text-muted-foreground">Поддерживайте актуальные данные, чтобы команде было проще связаться с вами.</p>
          </section>
          <Card className="max-w-5xl shadow-none">
            <CardHeader className="flex flex-row items-start gap-4"><Avatar className="size-16 border"><AvatarImage src={employee.image ?? undefined} alt="" /><AvatarFallback>{initials}</AvatarFallback></Avatar><div><CardTitle>{employee.name}</CardTitle><EmployeePhotoForm employeeId={employee.userId} editable /></div></CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-6 border-y py-5 sm:grid-cols-2"><div className="grid gap-1"><span className="text-sm text-muted-foreground">Рабочий email</span><span className="font-medium">{employee.email}</span></div><div className="grid gap-1"><span className="text-sm text-muted-foreground">Номер телефона</span><span className="font-medium">{employee.phone || "Не указан"}</span></div></div>
              <div className="grid gap-1"><span className="text-sm text-muted-foreground">Статус</span><span>{employeeStatusLabels[employee.status]}</span></div>
              <div className="grid gap-2 border-t pt-5"><span className="text-sm text-muted-foreground">Магазины</span>{employeeDetails?.stores.length ? <div className="flex flex-wrap gap-2">{employeeDetails.stores.map((store) => <span className="rounded-lg bg-muted px-3 py-2 text-sm" key={`${store.id}-${store.role}`}>{store.name}</span>)}</div> : <span className="text-sm">Магазины пока не назначены.</span>}</div>
              <form action={updateMyProfile} className="grid gap-5 border-t pt-6 sm:max-w-2xl">
                <label className="grid gap-1.5 text-sm font-medium">Должность<Input name="jobTitle" defaultValue={employee.jobTitle ?? ""} maxLength={100} placeholder="Например, консультант" /></label>
                <label className="grid gap-1.5 text-sm font-medium">Телефон<Input name="phone" defaultValue={employee.phone ?? ""} maxLength={40} autoComplete="tel" placeholder="+7" /></label>
                <label className="grid gap-1.5 text-sm font-medium">О себе<textarea name="about" defaultValue={employee.about ?? ""} maxLength={500} rows={4} className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs" placeholder="Коротко о вашей работе" /></label>
                <Button className="min-h-11 w-full sm:w-fit" type="submit">Сохранить изменения</Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
