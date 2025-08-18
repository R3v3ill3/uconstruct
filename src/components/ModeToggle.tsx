import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import * as React from "react"

export function ModeToggle() {
  const [isDark, setIsDark] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false
    const stored = window.localStorage.getItem("theme")
    if (stored) return stored === "dark"
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  React.useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add("dark")
      window.localStorage.setItem("theme", "dark")
    } else {
      root.classList.remove("dark")
      window.localStorage.setItem("theme", "light")
    }
  }, [isDark])

  return (
    <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setIsDark(v => !v)}>
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}

