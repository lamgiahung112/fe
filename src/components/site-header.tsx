import { siteConfig } from "@/config/site.ts"
import { cn } from "@/lib/utils"
import useUser from "@/stores/user-store"
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Bell, MessageCircle, LogOut, Moon, Sun } from "lucide-react"
import getNotificationApi from "@/apis/get_notification.ts"
import { Notification } from "@/types/notification.ts"
import { format } from "date-fns"
import readAllNotiApi from "@/apis/read_all_noti.ts"

export function SiteHeader() {
	const { isAuthenticated, user, logout } = useUser()
	const [searchKeyword, setSearchKeyword] = useState("")
	const navigate = useNavigate()
	const [unreadCount, setUnreadCount] = useState<number>(0)
	const [notifications, setNotifications] = useState<Notification[]>([])
	const [showNotifications, setShowNotifications] = useState(false)
	const notificationRef = useRef<HTMLDivElement>(null)
	const [darkMode, setDarkMode] = useState<boolean>(
		() => localStorage.getItem("theme") === "dark",
	)

	useEffect(() => {
		if (!isAuthenticated) return

		const fetchNotifications = () => {
			getNotificationApi(0)
				.then((data) => {
					setNotifications(data)
					setUnreadCount(data.filter((noti) => !noti.isRead).length)
				})
				.catch((err) => console.error("Failed to fetch notifications:", err))
		}

		fetchNotifications()
		const timer = setInterval(fetchNotifications, 2000)
		return () => clearInterval(timer)
	}, [isAuthenticated])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				notificationRef.current &&
				!notificationRef.current.contains(event.target as Node)
			) {
				setShowNotifications(false)
			}
		}
		document.addEventListener("mousedown", handleClickOutside)
		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [])

	useEffect(() => {
		if (darkMode) {
			document.documentElement.classList.add("dark")
			localStorage.setItem("theme", "dark")
		} else {
			document.documentElement.classList.remove("dark")
			localStorage.setItem("theme", "light")
		}
	}, [darkMode])

	const handleBellClick = () => {
		setShowNotifications(!showNotifications)
	}

	const handleLogout = () => {
		logout()
		navigate("/login")
	}

	return (
		<header
			className="sticky top-0 z-40 w-full border-b 
  bg-gradient-to-r from-blue-200 via-blue-50 to-white 
  transition-colors duration-200 dark:from-gray-800 
  dark:via-gray-950 dark:to-black"
		>
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
							className="w-[50%]
						rounded-md border border-gray-300 bg-white px-3
						py-2 text-sm text-black
						placeholder-gray-500
						transition-colors focus:border-blue-500 focus:outline-none focus:ring-2
						focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white
						dark:placeholder-gray-400
					"
						/>
						<button
							onClick={() => navigate("/search?keyword=" + searchKeyword)}
							className="
								rounded-md bg-primary px-4 py-2 text-sm
								font-medium text-primary-foreground
								transition-colors
								hover:bg-primary/90 dark:bg-blue-600 dark:text-white
								dark:hover:bg-blue-700
							"
						>
							Find
						</button>
					</div>
				)}

				{isAuthenticated && user && (
					<nav className="flex items-center gap-4">
						<Link
							to="/me"
							className={cn(
								"flex items-center gap-x-2 text-sm font-medium text-muted-foreground",
							)}
						>
							<img
								className="h-8 w-8 rounded-full"
								src={"http://localhost:8080/files/" + user.avatarUrl}
								alt="User avatar"
							/>
							{user.name}
						</Link>

						{/* Dark mode toggle */}
						<button
							onClick={() => setDarkMode(!darkMode)}
							className="rounded-full p-2 hover:bg-gray-100"
							title="Toggle Dark Mode"
						>
							{darkMode ? (
								<Sun className="h-5 w-5 text-yellow-500" />
							) : (
								<Moon className="h-5 w-5 text-gray-600" />
							)}
						</button>

						{/* Notification */}
						<div className="relative" ref={notificationRef}>
							<button
								onClick={handleBellClick}
								className="relative flex items-center"
								aria-label="Notifications"
							>
								<Bell className="h-6 w-6" />
								{unreadCount > 0 && (
									<span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
										{unreadCount}
									</span>
								)}
							</button>
							{showNotifications && (
								<div className="absolute right-0 mt-2 w-64 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-900 dark:ring-gray-700">
									<div className="border-b p-2 dark:border-gray-700">
										<h3 className="text-sm font-medium text-gray-800 dark:text-white">
											Notifications
										</h3>
									</div>
									<div className="max-h-96 overflow-y-auto">
										{notifications.length > 0 ? (
											notifications.map((notification) => (
												<div
													key={notification.id}
													onClick={() => navigate(notification.link)}
													className={cn(
														"cursor-pointer border-b p-3",
														notification.isRead
															? "bg-white dark:bg-gray-900"
															: "bg-blue-50 dark:bg-blue-600/20",
													)}
												>
													<p className="text-sm text-gray-800 dark:text-white">
														{notification.message}
													</p>
													<p className="mt-1 text-xs text-gray-500">
														{format(
															notification.createdAt * 1000,
															"MMM d, yyyy HH:mm",
														)}
													</p>
												</div>
											))
										) : (
											<div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
												No notifications
											</div>
										)}
									</div>
									{notifications.length > 0 && (
										<div className="p-2 text-center">
											<button
												onClick={() => readAllNotiApi()}
												className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
											>
												Mark all as read
											</button>
										</div>
									)}
								</div>
							)}
						</div>

						{/* Messenger shortcut */}
						<MessageCircle
							className="h-6 w-6 cursor-pointer"
							onClick={() => navigate("/messenger")}
						/>

						{/* Logout */}
						<button
							onClick={handleLogout}
							className="flex items-center gap-1 text-sm text-red-500 hover:underline"
						>
							<LogOut className="h-5 w-5" />
							Logout
						</button>
					</nav>
				)}
			</div>
		</header>
	)
}
