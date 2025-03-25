import { siteConfig } from "@/config/site.ts"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="text-lg font-medium">{siteConfig.name}</div>
      </div>
    </header>
  )
}
