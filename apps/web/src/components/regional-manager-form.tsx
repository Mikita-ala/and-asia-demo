"use client";

import { useActionState } from "react";
import { assignRegionalManager } from "@/app/actions/employees";
import { Button } from "@/components/ui/button";
import type { EmployeeWithStores, Region } from "@/lib/employees";

export function RegionalManagerForm({ employees, regions }: { employees: EmployeeWithStores[]; regions: Region[] }) {
  const [state, action, pending] = useActionState(assignRegionalManager, null);
  return <form action={action} className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-[1fr_1fr_auto]"><label className="grid gap-1.5 text-sm font-medium">Сотрудник<select name="employeeId" defaultValue="" required className="min-h-11 rounded-lg border bg-background px-3 pr-10"><option value="" disabled>Выберите сотрудника</option>{employees.map((employee) => <option key={employee.userId} value={employee.userId}>{employee.name}</option>)}</select></label><label className="grid gap-1.5 text-sm font-medium">Регион<select name="regionId" defaultValue="" required className="min-h-11 rounded-lg border bg-background px-3 pr-10"><option value="" disabled>Выберите регион</option>{regions.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}</select></label><div className="flex items-end"><Button type="submit" className="min-h-11 w-full" disabled={pending}>{pending ? "Сохраняем…" : "Назначить"}</Button></div>{state?.error ? <p className="text-sm text-destructive sm:col-span-3">{state.error}</p> : null}</form>;
}
