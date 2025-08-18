import { cn } from "@/lib/utils"
import { Heading } from "@/components/ui/text"
import * as React from "react"

interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  trailing?: React.ReactNode
}

export const Toolbar: React.FC<ToolbarProps> = ({ title, trailing, className, children, ...props }) => {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "border-b",
        className
      )}
      {...props}
    >
      <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center gap-4">
          <div className="flex-1">
            {title ? <Heading role="title2" as="h2">{title}</Heading> : children}
          </div>
          <div className="flex items-center gap-2">{trailing}</div>
        </div>
      </div>
    </header>
  )
}

