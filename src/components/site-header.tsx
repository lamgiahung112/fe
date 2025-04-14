import { siteConfig } from "@/config/site.ts"
import { cn } from "@/lib/utils"
import useUser from "@/stores/user-store"
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Bell, MessageCircle } from "lucide-react"
import getNotificationApi from "@/apis/get_notification.ts"
import { Notification } from "@/types/notification.ts"
import { format } from "date-fns"
import readAllNotiApi from "@/apis/read_all_noti.ts"

export function SiteHeader() {
	const { isAuthenticated, user } = useUser()
	const [searchKeyword, setSearchKeyword] = useState("")
	const navigate = useNavigate()
	const [unreadCount, setUnreadCount] = useState<number>(0)
	const [notifications, setNotifications] = useState<Notification[]>([])
	const [showNotifications, setShowNotifications] = useState(false)
	const notificationRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!isAuthenticated) return

		const fetchNotifications = () => {
			getNotificationApi(0)
				.then(data => {
					setNotifications(data)
					setUnreadCount(data.filter(noti => !noti.isRead).length)
				})
				.catch(err => console.error("Failed to fetch notifications:", err))
		}

		fetchNotifications() // Initial fetch
		const timer = setInterval(fetchNotifications, 2000)

		return () => {
			clearInterval(timer)
		}
	}, [isAuthenticated])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
				setShowNotifications(false)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [])

	const handleBellClick = () => {
		setShowNotifications(!showNotifications)
	}

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
					<nav className="flex gap-6 items-center">
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
						<div className="relative" ref={notificationRef}>
							<button
								onClick={handleBellClick}
								className="relative flex items-center"
								aria-label="Notifications"
							>
								<Bell className="h-6 w-6" />
								{unreadCount > 0 && (
									<span className="absolute -top-2 -right-2 flex justify-center items-center rounded-full h-5 w-5 text-xs bg-red-500 text-white">{unreadCount}</span>
								)}
							</button>

							{showNotifications && (
								<div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
									<div className="p-2 border-b">
										<h3 className="text-sm font-medium">Notifications</h3>
									</div>
									<div className="max-h-96 overflow-y-auto">
										{notifications.length > 0 ? (
											notifications.map((notification) => (
												<div
													onClick={() => {
														navigate(notification.link)
													}}
													key={notification.id}
													className={`p-3 border-b cursor-pointer ${notification.isRead ? 'bg-white' : 'bg-blue-50'}`}
												>
													<p className="text-sm">{notification.message}</p>
													<p className="text-xs text-gray-500 mt-1">{format(notification.createdAt * 1000, "MMM d, yyyy HH:mm")}</p>
												</div>
											))
										) : (
											<div className="p-4 text-center text-sm text-gray-500">No notifications</div>
										)}
									</div>
									{notifications.length > 0 && (
										<div className="p-2 text-center">
											<button onClick={() => readAllNotiApi()} className="text-xs text-blue-600 hover:text-blue-800">
												Mark all as read
											</button>
										</div>
									)}
								</div>
							)}
						</div>
						<MessageCircle className="h-6 w-6 cursor-pointer" onClick={() => navigate("/messenger")} />
					</nav>
				)}
			</div>
		</header>
	)
}
