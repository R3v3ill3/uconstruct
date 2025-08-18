import * as React from "react";
import { cn } from "@/lib/utils";

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
  | "caption";

const roleToClasses: Record<Role, string> = {
  display: "text-[56px] leading-[64px] font-semibold tracking-tight",
  largeTitle: "text-[34px] leading-[40px] font-semibold tracking-tight",
  title1: "text-[28px] leading-[34px] font-semibold",
  title2: "text-[22px] leading-[28px] font-semibold",
  title3: "text-[20px] leading-[26px] font-medium",
  headline: "text-[17px] leading-[24px] font-semibold",
  body: "text-[17px] leading-[24px]",
  callout: "text-[16px] leading-[22px]",
  subheadline: "text-[15px] leading-[22px] text-muted-foreground",
  footnote: "text-[13px] leading-[18px] text-muted-foreground",
  caption: "text-[12px] leading-[16px] text-muted-foreground",
};

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  roleName?: Role;
  as?: keyof JSX.IntrinsicElements;
}

export function Text({ roleName = "body", as = "p", className, ...props }: TextProps) {
  const Comp: any = as;
  return <Comp className={cn(roleToClasses[roleName], className)} {...props} />;
}

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  roleName?: Exclude<Role, "body" | "callout" | "subheadline" | "footnote" | "caption">;
}

export function Heading({ level = 2, roleName = "title2", className, ...props }: HeadingProps) {
  const Comp = (`h${level}` as unknown) as keyof JSX.IntrinsicElements;
  return <Comp className={cn(roleToClasses[roleName], className)} {...props} />;
}

