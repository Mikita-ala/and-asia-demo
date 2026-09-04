"use client";

import { useActionState } from "react";
import { CameraIcon } from "lucide-react";

import { uploadEmployeePhotoAction } from "@/app/actions/employees";

export function EmployeePhotoForm({ employeeId, editable }: { employeeId: string; editable: boolean }) {
  const [state, action, pending] = useActionState(uploadEmployeePhotoAction, null);
  if (!editable) return null;
  return <form action={action} className="mt-3"><input type="hidden" name="employeeId" value={employeeId} /><label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted"><CameraIcon aria-hidden="true" className="size-4" /><span>{pending ? "Загружаем…" : "Изменить фото"}</span><input className="sr-only" name="photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={pending} onChange={(event) => event.currentTarget.form?.requestSubmit()} /></label>{state?.error ? <p className="mt-2 text-sm text-destructive" role="alert">{state.error}</p> : null}</form>;
}
