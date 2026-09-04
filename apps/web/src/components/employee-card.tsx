import Link from "next/link";
import { MailIcon, MapPinIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { EmployeeWithStores } from "@/lib/employees";

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export function EmployeeCard({ employee }: { employee: EmployeeWithStores }) {
  const firstStore = employee.stores[0];
  return (
    <Link href={`/ru/team/${employee.userId}`} className="group flex min-h-44 flex-col rounded-xl border bg-card p-5 transition-[border-color,background-color,transform] duration-150 hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <div className="flex items-start gap-3">
        <Avatar className="size-12 border"><AvatarImage src={employee.image ?? undefined} alt="" /><AvatarFallback>{initials(employee.name)}</AvatarFallback></Avatar>
        <div className="min-w-0"><h2 className="truncate font-semibold">{employee.name}</h2><p className="mt-1 truncate text-sm text-muted-foreground">{employee.jobTitle || "Сотрудник"}</p></div>
      </div>
      <div className="mt-auto space-y-2 pt-5 text-sm text-muted-foreground">
        <p className="flex items-center gap-2 truncate"><MailIcon aria-hidden="true" className="size-4 shrink-0" />{employee.email}</p>
        <p className="flex items-center gap-2 truncate"><MapPinIcon aria-hidden="true" className="size-4 shrink-0" />{firstStore ? `${firstStore.name}${employee.stores.length > 1 ? ` · ещё ${employee.stores.length - 1}` : ""}` : "Магазин не назначен"}</p>
      </div>
    </Link>
  );
}
