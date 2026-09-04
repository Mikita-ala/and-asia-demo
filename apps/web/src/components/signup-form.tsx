"use client"

import * as React from "react"
import Link from "next/link"

import { authClient } from "@/lib/auth-client"
import { saveRegistrationJobTitle } from "@/app/actions/employees"
import { getAuthErrorMessage } from "@/lib/auth-error"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  const [error, setError] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const form = new FormData(event.currentTarget)
    const password = String(form.get("password"))
    if (password !== String(form.get("confirmPassword"))) {
      setError("Пароли не совпадают.")
      return
    }
    setPending(true)
    const result = await authClient.signUp.email({
      name: String(form.get("name")),
      email: String(form.get("email")),
      password,
      callbackURL: "/ru/dashboard",
    })
    if (result.error) {
      setPending(false)
      setError(getAuthErrorMessage(result.error, "Не удалось создать учётную запись."))
      return
    }
    const profile = await saveRegistrationJobTitle(String(form.get("jobTitle")))
    setPending(false)
    if (profile.error) setError(profile.error)
  }

  return (
    <div className={cn("flex flex-col gap-5", className)} {...props}>
      <Card className="overflow-hidden border-border/80 p-0 shadow-sm">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 sm:p-8" onSubmit={onSubmit}>
            <FieldGroup>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold tracking-[0.18em] text-primary">AND ASIA</p>
                <h1 className="text-2xl font-semibold tracking-tight">Начните работу с командой</h1>
                <p className="text-pretty text-sm leading-6 text-muted-foreground">Соберите задачи, точки и важные результаты в одном рабочем пространстве.</p>
              </div>
              <Field>
                <FieldLabel htmlFor="name">Имя и фамилия</FieldLabel>
                <Input id="name" name="name" autoComplete="name" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Рабочий email</FieldLabel>
                <Input id="email" name="email" type="email" autoComplete="email" placeholder="name@company.kz" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="jobTitle">Должность</FieldLabel>
                <Input id="jobTitle" name="jobTitle" autoComplete="organization-title" maxLength={100} placeholder="Например, консультант" required />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="password">Пароль</FieldLabel>
                  <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirmPassword">Повторите пароль</FieldLabel>
                  <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required />
                </Field>
              </div>
              <FieldDescription>Используйте не менее 8 символов.</FieldDescription>
              {error ? <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{error}</p> : null}
              <Field>
                <Button className="min-h-11 w-full" type="submit" disabled={pending}>{pending ? "Создаём…" : "Создать аккаунт"}</Button>
              </Field>
              <FieldDescription className="text-center">Уже есть учётная запись? <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/login">Войти</Link></FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative hidden bg-muted p-8 md:block">
            <div className="absolute left-8 top-8 flex size-12 items-center justify-center rounded-xl bg-background text-xl font-semibold shadow-sm">A</div>
            <div className="flex h-full flex-col justify-end gap-3">
              <p className="text-sm font-medium">Всё важное рядом</p>
              <p className="max-w-xs text-3xl font-semibold leading-tight tracking-tight">Держите день команды в фокусе.</p>
              <p className="max-w-sm text-sm leading-6 text-muted-foreground">Задачи, смены и результаты — в одном удобном ритме.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
