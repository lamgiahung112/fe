import * as React from "react"
import { cn } from "@/lib/utils" // Hàm nối class tailwind

// Component Input với hỗ trợ dark mode
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        {...props}
        className={cn(
          // Class Tailwind gốc + dark mode
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          // Hỗ trợ dark mode rõ ràng
          "dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400",
          className
        )}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
