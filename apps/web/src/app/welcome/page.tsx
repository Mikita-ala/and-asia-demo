import Link from "next/link";

import { requireSession } from "@/lib/session";

export default async function WelcomePage() {
  await requireSession();
  return <main className="flex min-h-svh items-center justify-center bg-background p-4"><section className="w-full max-w-md border-y py-10 sm:border sm:px-10"><p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground">AND ASIA</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Профиль создан</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Добавьте несколько деталей — так коллегам будет проще связаться с вами.</p><Link className="mt-7 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-transform duration-150 hover:bg-primary/90 active:scale-[0.98]" href="/ru/profile">Открыть профиль</Link></section></main>;
}
