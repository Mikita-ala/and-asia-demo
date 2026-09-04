"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { forwardRef, useEffect } from "react"
import type { ComponentProps, MouseEvent } from "react"

type DocumentationLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string }

export const DocumentationLink = forwardRef<HTMLAnchorElement, DocumentationLinkProps>(function DocumentationLink({ children, href, onClick: onClickProp, ...props }, ref) {
  const router = useRouter()

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    onClickProp?.(event)
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    event.preventDefault()
    document.documentElement.dataset.documentationTransition = "leaving"
    window.setTimeout(() => router.push(href), 110)
  }

  return <Link ref={ref} href={href} onClick={onClick} {...props}>{children}</Link>
})

export function DocumentationTransitionReset() {
  useEffect(() => {
    delete document.documentElement.dataset.documentationTransition
  }, [])

  return null
}
