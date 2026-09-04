"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"
import { getAuthErrorMessage } from "@/lib/auth-error"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [error, setError] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)
    const data = new FormData(event.currentTarget)
    const result = await authClient.signIn.email({
      email: String(data.get("email")),
      password: String(data.get("password")),
      callbackURL: "/ru/dashboard",
    })
    setPending(false)
    if (result.error) setError(getAuthErrorMessage(result.error, "Не удалось войти. Проверьте данные."))
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 sm:p-8" onSubmit={onSubmit}>
            <FieldGroup>
              <div className="flex flex-col gap-2 text-left">
                <p className="text-xs font-semibold tracking-[0.18em] text-primary">AND ASIA</p>
                <h1 className="text-2xl font-semibold tracking-tight">Войти в рабочее пространство</h1>
                <p className="text-pretty text-sm leading-6 text-muted-foreground">
                  Задачи, смены и главное по команде — в одном месте.
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.kz"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center justify-between gap-3">
                  <FieldLabel htmlFor="password">Пароль</FieldLabel>
                </div>
                <Input id="password" name="password" type="password" autoComplete="current-password" required />
              </Field>
              {error ? <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{error}</p> : null}
              <Field>
                <Button className="min-h-11 w-full" type="submit" disabled={pending}>
                  {pending ? "Входим…" : "Войти"}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Нет учётной записи? <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/signup">Зарегистрироваться</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative hidden bg-primary p-8 text-primary-foreground md:block">
            <div className="absolute inset-x-8 top-8 h-px bg-primary-foreground/20" />
            <div className="flex h-full flex-col justify-end gap-3">
              <p className="text-sm font-medium">Рабочий день без лишнего</p>
              <p className="max-w-xs text-3xl font-semibold leading-tight tracking-tight">Команда и точки всегда в одном ритме.</p>
              <p className="max-w-sm text-sm leading-6 text-primary-foreground/70">Быстрее замечайте важное и доводите задачи до результата.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
