import { siteConfig } from "@/config/site.ts"
import { cn } from "@/lib/utils"
import useUser from "@/stores/user-store"
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
	Bell,
	MessageCircle,
	LogOut,
	Moon,
	Sun,
	Search,
	User,
	Settings,
	Lock,
} from "lucide-react"
import getNotificationApi from "@/apis/get_notification.ts"
import { Notification } from "@/types/notification.ts"
import { format } from "date-fns"
import readAllNotiApi from "@/apis/read_all_noti.ts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
	const userMenuRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!isAuthenticated) return

		const fetchNotifications = () => {
			getNotificationApi(0)
				.then((data) => {
					setNotifications(data)
					setUnreadCount(data.filter((noti) => !noti.isRead).length)
				})
				.catch((err) => setNotifications([]))
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
			if (
				userMenuRef.current &&
				!userMenuRef.current.contains(event.target as Node)
			) {
				setIsUserMenuOpen(false)
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
		<header className="sticky top-0 z-40 w-full border-b bg-gradient-to-r from-blue-200 via-blue-50 to-white transition-colors duration-200 dark:from-gray-800 dark:via-gray-950 dark:to-black">
			<div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
				<Link to="/" className="flex items-center gap-2 text-lg font-medium">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							className="h-5 w-5"
						>
							<path d="M8.75 13.5C8.75 14.88 7.63 16 6.25 16C4.87 16 3.75 14.88 3.75 13.5C3.75 12.12 4.87 11 6.25 11C7.63 11 8.75 12.12 8.75 13.5Z" />
							<path d="M15.75 13.5C15.75 14.88 16.87 16 18.25 16C19.63 16 20.75 14.88 20.75 13.5C20.75 12.12 19.63 11 18.25 11C16.87 11 15.75 12.12 15.75 13.5Z" />
							<path d="M12 11.5C13.1 11.5 14 10.6 14 9.5C14 8.4 13.1 7.5 12 7.5C10.9 7.5 10 8.4 10 9.5C10 10.6 10.9 11.5 12 11.5Z" />
							<path d="M7.5 18C7.5 16.34 9.34 15 11 15H13C14.66 15 16.5 16.34 16.5 18V20H7.5V18Z" />
						</svg>
					</div>
					{siteConfig.name}
				</Link>

				{isAuthenticated && user && (
					<div className="flex flex-grow items-center justify-center space-x-4">
						<div className="relative w-[50%]">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
							<input
								type="text"
								placeholder="Search..."
								value={searchKeyword}
								onChange={(e) => setSearchKeyword(e.target.value)}
								className="w-full rounded-full border border-gray-300 bg-white px-10 py-2 text-sm text-black placeholder-gray-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
							/>
						</div>
						<button
							onClick={() => navigate("/search?keyword=" + searchKeyword)}
							className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
						>
							Find
						</button>
					</div>
				)}

				{isAuthenticated && user && (
					<nav className="flex items-center gap-4">
						{/* Dark mode toggle */}
						<button
							onClick={() => setDarkMode(!darkMode)}
							className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
							title="Toggle Dark Mode"
						>
							{darkMode ? (
								<Sun className="h-5 w-5 text-yellow-500" />
							) : (
								<Moon className="h-5 w-5" />
							)}
						</button>

						{/* Notification */}
						<div className="relative" ref={notificationRef}>
							<button
								onClick={handleBellClick}
								className="relative flex items-center rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
								aria-label="Notifications"
							>
								<Bell className="h-5 w-5" />
								{unreadCount > 0 && (
									<span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
										{unreadCount}
									</span>
								)}
							</button>
							{showNotifications && (
								<div className="absolute right-0 mt-2 w-80 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-900 dark:ring-gray-700">
									<div className="border-b p-3 dark:border-gray-700">
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
														"cursor-pointer border-b p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800",
														notification.isRead
															? "bg-white dark:bg-gray-900"
															: "bg-blue-50 dark:bg-blue-600/20",
													)}
												>
													<p className="text-sm text-gray-800 dark:text-white">
														{notification.message}
													</p>
													<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
														{format(
															notification.createdAt * 1000,
															"MMM d, yyyy HH:mm",
														)}
													</p>
												</div>
											))
										) : (
											<div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
												No notifications
											</div>
										)}
									</div>
									{notifications.length > 0 && (
										<div className="border-t p-2 text-center dark:border-gray-700">
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
						<button
							onClick={() => navigate("/messenger")}
							className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
						>
							<MessageCircle className="h-5 w-5" />
						</button>

						{/* User menu */}
						<div className="relative" ref={userMenuRef}>
							<div
								className="flex cursor-pointer items-center gap-2 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
								onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
							>
								<Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700">
									<AvatarImage
										src={`http://localhost:8080/files/${user.avatarUrl}`}
										alt={user.name}
										onError={(e) => {
											;(e.target as HTMLImageElement).src =
												"/placeholder.svg?height=32&width=32"
										}}
									/>
									<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
								</Avatar>
							</div>

							{isUserMenuOpen && (
								<div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl border border-gray-200 bg-white shadow-lg transition-all dark:border-gray-700 dark:bg-gray-900">
									<div className="p-4">
										<div className="flex items-center gap-3">
											<Avatar className="h-12 w-12 border-2 border-blue-100 dark:border-blue-900">
												<AvatarImage
													src={`http://localhost:8080/files/${user.avatarUrl}`}
													alt={user.name}
													onError={(e) => {
														;(e.target as HTMLImageElement).src =
															"/placeholder.svg?height=48&width=48"
													}}
												/>
												<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
											</Avatar>
											<div>
												<h4 className="font-medium text-gray-900 dark:text-white">
													{user.name}
												</h4>
												<p className="text-sm text-gray-500 dark:text-gray-400">
													@{user.username}
												</p>
											</div>
										</div>
									</div>

									<div className="border-t border-gray-200 dark:border-gray-700">
										<button
											className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
											onClick={() => {
												navigate("/me")
												setIsUserMenuOpen(false)
											}}
										>
											<User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
											<span>Your Profile</span>
										</button>
										{/*
										<button
											className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
											onClick={() => {
												navigate("/settings")
												setIsUserMenuOpen(false)
											}}
										>
											<Settings className="h-5 w-5 text-gray-500 dark:text-gray-400" />
											<span>Edit Profile</span>
										</button>
										*/}

										<button
											className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
											onClick={() => {
												navigate("/forget_password")
												setIsUserMenuOpen(false)
											}}
										>
											<Lock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
											<span>Reset Password</span>
										</button>
									</div>

									<div className="border-t border-gray-200 dark:border-gray-700">
										<button
											className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
											onClick={() => {
												handleLogout()
												setIsUserMenuOpen(false)
											}}
										>
											<LogOut className="h-5 w-5" />
											<span>Log Out</span>
										</button>
									</div>
								</div>
							)}
						</div>
					</nav>
				)}
			</div>
		</header>
	)
}
