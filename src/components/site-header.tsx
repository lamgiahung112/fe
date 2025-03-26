import { siteConfig } from "@/config/site.ts"
import { cn } from "@/lib/utils"
import useUser from "@/stores/user-store"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

export function SiteHeader() {
	const { isAuthenticated, user } = useUser()
	const [searchKeyword, setSearchKeyword] = useState("")
	const navigate = useNavigate()

	return (
		<header className="sticky top-0 z-40 w-full border-b bg-background">
			<div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
				<Link to="/" className="text-lg font-medium">
					{siteConfig.name}
				</Link>
				{isAuthenticated && user && (
					<div className="flex flex-grow items-center justify-center space-x-4">
						<input
							type="text"
							placeholder="Search..."
							value={searchKeyword}
							onChange={(e) => setSearchKeyword(e.target.value)}
							className="w-[50%] rounded-md border px-3 py-2 text-sm"
						/>
						<button
							onClick={() => {
								navigate("/search?keyword="+searchKeyword)
							}}
							className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
						>
							Find
						</button>
					</div>
				)}
				{isAuthenticated && user && (
					<nav className="flex gap-6">
						<Link
							to="/me"
							className={cn(
								"flex items-center gap-x-2 text-sm font-medium text-muted-foreground",
							)}
						>
							<img
								className="h-8 w-8 rounded-full"
								src={"http://localhost:8080/files/" + user.avatarUrl}
							/>
							{user.name}
						</Link>
					</nav>
				)}
			</div>
		</header>
	)
}
