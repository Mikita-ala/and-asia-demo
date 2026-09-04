"use client";

import { useActionState } from "react";

import { assignEmployeeToStore, removeEmployeeFromStore, updateEmployeeProfile } from "@/app/actions/employees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EmployeeRole, EmployeeWithStores, Store } from "@/lib/employees";

const employeeRoleLabels: Record<EmployeeRole, string> = {
  administrator: "Администратор",
  commercial_director: "Коммерческий директор",
  category_manager: "Категорийный менеджер",
  logistics: "Логистика",
  territorial_manager: "Региональный менеджер",
  senior_consultant: "Старший консультант",
  consultant: "Консультант",
  merchandiser: "Мерчандайзер",
};

export function EmployeeManagement({ employee, stores }: { employee: EmployeeWithStores; stores: Store[] }) {
  const [profileState, profileAction, profilePending] = useActionState(updateEmployeeProfile, null);
  const [storeState, storeAction, storePending] = useActionState(assignEmployeeToStore, null);
  const [removeState, removeAction, removePending] = useActionState(removeEmployeeFromStore, null);

  return (
    <section className="grid gap-6 border-t pt-8">
      <div>
        <p className="text-sm font-medium">Управление</p>
        <p className="mt-1 text-sm text-muted-foreground">Обновите телефон, статус работы и закрепление за магазином.</p>
      </div>

      <form action={profileAction} className="grid gap-4 rounded-xl border bg-card p-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
        <input type="hidden" name="employeeId" value={employee.userId} />
        <label className="grid gap-1.5 text-sm font-medium">
          Телефон
          <Input name="phone" defaultValue={employee.phone ?? ""} inputMode="tel" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Статус
          <select name="status" defaultValue={employee.status} className="min-h-11 rounded-lg border bg-background px-3">
            <option value="pending">Новый сотрудник</option>
            <option value="active">Работает</option>
            <option value="suspended">Работа приостановлена</option>
          </select>
        </label>
        <Button className="min-h-11 sm:w-auto" type="submit" disabled={profilePending}>
          {profilePending ? "Сохраняем…" : "Сохранить"}
        </Button>
        {profileState?.error ? <p className="text-sm text-destructive sm:col-span-3">{profileState.error}</p> : null}
      </form>

      <div className="grid gap-4">
        <div>
          <h2 className="text-base font-semibold">Магазины и роли</h2>
          <p className="mt-1 text-sm text-muted-foreground">Укажите магазин и роль сотрудника в нём.</p>
        </div>

        <form action={storeAction} className="grid gap-4 rounded-xl border bg-muted/30 p-5 sm:grid-cols-2">
          <input type="hidden" name="employeeId" value={employee.userId} />
          <label className="grid gap-1.5 text-sm font-medium">
            Магазин
            <select name="storeId" required defaultValue="" className="min-h-11 w-full rounded-lg border bg-background px-3">
              <option disabled value="">Выберите магазин</option>
              {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Роль
            <select name="role" defaultValue="consultant" className="min-h-11 w-full rounded-lg border bg-background px-3">
              <option value="territorial_manager">Региональный менеджер</option>
              <option value="senior_consultant">Старший консультант</option>
              <option value="consultant">Консультант</option>
              <option value="merchandiser">Мерчандайзер</option>
            </select>
          </label>
          <div className="sm:col-span-2 sm:flex sm:justify-end">
            <Button className="min-h-11 w-full sm:w-auto" type="submit" disabled={storePending}>
              {storePending ? "Добавляем…" : "Добавить магазин"}
            </Button>
          </div>
          {storeState?.error ? <p className="text-sm text-destructive sm:col-span-2">{storeState.error}</p> : null}
        </form>

        {employee.stores.length > 0 ? (
          <ul className="grid gap-2" aria-label="Закреплённые магазины">
            {employee.stores.map((store) => (
              <li className="flex min-h-14 flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between" key={store.id}>
                <div>
                  <p className="font-medium">{store.name}</p>
                  <p className="text-sm text-muted-foreground">{store.regionName} · {employeeRoleLabels[store.role]}</p>
                </div>
                <form action={removeAction}>
                  <input type="hidden" name="employeeId" value={employee.userId} />
                  <input type="hidden" name="storeId" value={store.id} />
                  <Button variant="outline" className="min-h-11 w-full sm:w-auto" type="submit" disabled={removePending}>Убрать</Button>
                </form>
              </li>
            ))}
          </ul>
        ) : null}
        {removeState?.error ? <p className="text-sm text-destructive">{removeState.error}</p> : null}
      </div>
    </section>
  );
}
