import * as React from "react"
import { cn } from "@/lib/utils"

type Role =
  | "display"
  | "largeTitle"
  | "title1"
  | "title2"
  | "title3"
  | "headline"
  | "body"
  | "callout"
  | "subheadline"
  | "footnote"
  | "caption"

const roleToClass: Record<Role, string> = {
  display: "text-[56px] leading-[64px] font-semibold tracking-tight",
  largeTitle: "text-[34px] leading-[40px] font-semibold",
  title1: "text-[28px] leading-[34px] font-semibold",
  title2: "text-[22px] leading-[28px] font-semibold",
  title3: "text-[20px] leading-[26px] font-semibold",
  headline: "text-[17px] leading-[24px] font-semibold",
  body: "text-[17px] leading-[24px]",
  callout: "text-[16px] leading-[22px]",
  subheadline: "text-[15px] leading-[22px]",
  footnote: "text-[13px] leading-[18px]",
  caption: "text-[12px] leading-[16px]",
}

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  role?: Role
  asChild?: boolean
}

export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, role = "body", ...props }, ref) => {
    return (
      <p ref={ref} className={cn(roleToClass[role], className)} {...props} />
    )
  }
)
Text.displayName = "Text"

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  role?: Extract<Role, "display" | "largeTitle" | "title1" | "title2" | "title3">
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, role = "title1", as = "h2", ...props }, ref) => {
    const Comp = as
    return (
      <Comp ref={ref} className={cn(roleToClass[role], className)} {...props} />
    )
  }
)
Heading.displayName = "Heading"

