"use client";

import { useActionState } from "react";

import { grantOrganizationRole } from "@/app/actions/employees";
import { Button } from "@/components/ui/button";

type Role = { value: string; label: string };

export function TeamAccessForm({
  employeeId,
  organizationId,
  roles,
}: {
  employeeId: string;
  organizationId: string;
  roles: Role[];
}) {
  const [state, action, pending] = useActionState(grantOrganizationRole, null);

  return (
    <form action={action} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
      <input name="employeeId" type="hidden" value={employeeId} />
      <input name="organizationId" type="hidden" value={organizationId} />
      <label className="grid min-w-0 flex-1 gap-1.5 text-sm font-medium">
        Роль в компании
        <select name="role" defaultValue="" required className="min-h-11 rounded-md border border-input bg-background px-3 text-sm shadow-xs">
          <option value="" disabled>Выберите роль</option>
          {roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
        </select>
      </label>
      <Button className="min-h-11 sm:w-auto" disabled={pending} type="submit">
        {pending ? "Сохраняем…" : "Добавить роль"}
      </Button>
      {state?.error ? <p className="text-sm text-destructive sm:col-span-2" role="alert">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-emerald-700">Роль добавлена.</p> : null}
    </form>
  );
}
