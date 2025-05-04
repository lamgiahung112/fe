import type React from "react"
import {
	ArrowUp,
	Home,
	Plus,
	Users,
	UserPlus,
	Lock,
	Globe,
	X,
	ImageIcon,
	Video,
	Smile,
	MapPin,
} from "lucide-react"

import MiniChat from "@/components/mini-chat"
import PostUI from "@/components/post"
import useNewsfeed from "@/stores/newsfeed-store"
import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import useUser from "@/stores/user-store"
import { cn } from "@/lib/utils"
import type { User } from "@/types/user"
import getRecommendedFriends from "@/apis/get_recommended_friend"
import followApi from "@/apis/follow"
import getFollowersApi from "@/apis/get_followers"
import getFollowingsApi from "@/apis/get_followings"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import createPostApi from "@/apis/create_post"

// Define Group type
interface Group {
	id: string
	name: string
	description: string
	coverImage: string
	memberCount: number
	isPrivate: boolean
	createdAt: string
}

// Scroll to top button component
function ScrollToTopButton() {
	const [show, setShow] = useState(false)

	useEffect(() => {
		const handleScroll = () => {
			setShow(window.scrollY > 600)
		}

		window.addEventListener("scroll", handleScroll)
		return () => window.removeEventListener("scroll", handleScroll)
	}, [])

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" })
	}

	if (!show) return null

	return (
		<button
			onClick={scrollToTop}
			className="fixed bottom-24 right-6 z-50 rounded-full bg-blue-600 p-3 text-white shadow-lg transition-all hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
			title="Back to top"
		>
			<ArrowUp className="h-5 w-5" />
		</button>
	)
}

export default function HomePage() {
	const { posts, reset, get, getForFollowers, followers, followings } =
		useNewsfeed()
	const { user } = useUser()
	const navigate = useNavigate()

	const [hasReachedBottom, setHasReachedBottom] = useState(false)
	const [isOnFollowersTab, setIsOnFollowersTab] = useState(false)
	const [isOnGroupsTab, setIsOnGroupsTab] = useState(false)
	const [recommendedFriends, setRecommendedFriends] = useState<User[]>([])
	const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
	const [caption, setCaption] = useState("")
	const [file, setFile] = useState<File | null>(null)
	const [isPrivate, setIsPrivate] = useState<boolean>(false)
	const [showChat, setShowChat] = useState(false)
	const [showGroups, setShowGroups] = useState(false)
	const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
	const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
	const [activeTab, setActiveTab] = useState("text")
	const [previewUrl, setPreviewUrl] = useState<string | null>(null)
	const [location, setLocation] = useState("")
	const [mood, setMood] = useState("")

	// For chat user list
	const [mutualFriends, setMutualFriends] = useState<User[]>([])
	const [currentChatUser, setCurrentChatUser] = useState<User | null>(null)
	const [chatMessage, setChatMessage] = useState("")

	// For group creation
	const [groupName, setGroupName] = useState("")
	const [groupDescription, setGroupDescription] = useState("")
	const [groupCoverImage, setGroupCoverImage] = useState<File | null>(null)
	const [isGroupPrivate, setIsGroupPrivate] = useState(false)

	// Mock data for groups
	const [userGroups, setUserGroups] = useState<Group[]>([
		{
			id: "1",
			name: "Photography Enthusiasts",
			description:
				"A group for sharing photography tips and showcasing your best shots.",
			coverImage: "group-cover-1.jpg",
			memberCount: 128,
			isPrivate: false,
			createdAt: "2023-05-15T10:30:00Z",
		},
		{
			id: "2",
			name: "Web Developers Vietnam",
			description:
				"Connect with other web developers in Vietnam to share knowledge and opportunities.",
			coverImage: "group-cover-2.jpg",
			memberCount: 256,
			isPrivate: false,
			createdAt: "2023-06-20T14:45:00Z",
		},
		{
			id: "3",
			name: "Hanoi Food Lovers",
			description: "Discover and share the best food spots in Hanoi.",
			coverImage: "group-cover-3.jpg",
			memberCount: 512,
			isPrivate: true,
			createdAt: "2023-07-10T09:15:00Z",
		},
	])

	useEffect(() => {
		// Fetch recommended friends when component mounts
		getRecommendedFriends()
			.then((friends) => {
				// Loại bỏ trùng lặp bằng cách sử dụng Map với ID làm key
				const uniqueFriends = Array.from(
					new Map(friends.map((friend) => [friend.id, friend])).values(),
				)
				setRecommendedFriends(uniqueFriends)
			})
			.catch((error) => {
				console.error("Error fetching recommended friends:", error)
				toast.error("Failed to load recommended friends")
			})
			.finally(() => {
				//setIsLoading(false)
			})
	}, [])

	useEffect(() => {
		// Fetch followers and followings to determine mutual friends for chat
		Promise.all([getFollowersApi(), getFollowingsApi()])
			.then(([followersRes, followingsRes]) => {
				const followersList = followersRes.data
				const followingsList = followingsRes.data

				const mutual = followersList.filter((f: User) =>
					followingsList.some((u: User) => u.id === f.id),
				)
				setMutualFriends(mutual)
			})
			.catch((error) => {
				console.error("Error fetching followers/followings:", error)
			})
	}, [])

	useEffect(() => {
		// Reset posts and set up scroll listener
		reset()
		const handleScroll = () => {
			const scrolledToBottom =
				window.innerHeight + window.scrollY >=
				document.documentElement.scrollHeight - 10
			setHasReachedBottom(scrolledToBottom)
		}
		window.addEventListener("scroll", handleScroll)
		return () => window.removeEventListener("scroll", handleScroll)
	}, [reset])

	useEffect(() => {
		// Load more posts when user reaches bottom of page
		if (hasReachedBottom) {
			if (isOnFollowersTab) {
				getForFollowers(false)
			} else if (!isOnGroupsTab) {
				get(false)
			}
			// For groups tab, we would fetch more group posts here
		}
	}, [hasReachedBottom, isOnFollowersTab, isOnGroupsTab, getForFollowers, get])

	useEffect(() => {
		// Refresh posts when tab changes
		if (isOnFollowersTab) {
			setIsOnGroupsTab(false)
			getForFollowers(true)
		} else if (isOnGroupsTab) {
			setIsOnFollowersTab(false)
			// We would fetch group posts here
			// For now, we'll just reset the feed
			reset()
		} else {
			get(true)
		}
	}, [isOnFollowersTab, isOnGroupsTab, getForFollowers, get, reset])

	// Update preview URL when file changes
	useEffect(() => {
		if (file) {
			const url = URL.createObjectURL(file)
			setPreviewUrl(url)
			return () => URL.revokeObjectURL(url)
		} else {
			setPreviewUrl(null)
		}
	}, [file])

	function handleCreatePost() {
		if (!caption.trim() && !file) {
			toast.error("Please add a caption or media to your post")
			return
		}

		// Add location and mood to the caption if provided
		let finalCaption = caption
		if (location) {
			finalCaption += `\n📍 ${location}`
		}
		if (mood) {
			finalCaption += `\n😊 Feeling: ${mood}`
		}

		createPostApi(finalCaption, file, isPrivate)
			.then(() => {
				toast.success("Post created successfully!")
				// Refresh the feed to show the new post
				if (isOnFollowersTab) {
					getForFollowers(true)
				} else if (!isOnGroupsTab) {
					get(true)
				}
			})
			.catch((error) => {
				console.error("Create post error:", error)
				toast.error("Failed to create post")
			})
			.finally(() => {
				// Reset all form fields
				setCaption("")
				setFile(null)
				setPreviewUrl(null)
				setLocation("")
				setMood("")
				setIsPrivate(false)
				setActiveTab("text")
				setIsCreatePostOpen(false)
			})
	}

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		if (e.target.files && e.target.files[0]) {
			const selectedFile = e.target.files[0]
			setFile(selectedFile)

			// Set appropriate tab based on file type
			if (selectedFile.type.startsWith("image/")) {
				setActiveTab("photo")
			} else if (selectedFile.type.startsWith("video/")) {
				setActiveTab("video")
			}
		}
	}

	function handleSendMessage() {
		if (!chatMessage.trim() || !currentChatUser) return

		// Here you would typically call an API to send the message
		// For now, just show a toast and clear the input
		toast.success(`Message sent to ${currentChatUser.name}`)
		setChatMessage("")
	}

	function handleFollow(friendId: string, friendName: string) {
		followApi(friendId)
			.then(() => {
				toast.success(`You followed ${friendName}`)
				setRecommendedFriends((prev) => prev.filter((f) => f.id !== friendId))
			})
			.catch((error) => {
				console.error("Follow error:", error)
				toast.error("Failed to follow user")
			})
	}

	function handleCreateGroup() {
		if (!groupName.trim()) {
			toast.error("Please enter a group name")
			return
		}

		// Here you would typically call an API to create the group
		// For now, we'll just add it to our local state
		const newGroup: Group = {
			id: `group-${Date.now()}`,
			name: groupName,
			description: groupDescription,
			coverImage: groupCoverImage
				? URL.createObjectURL(groupCoverImage)
				: "default-group-cover.jpg",
			memberCount: 1, // Just the creator
			isPrivate: isGroupPrivate,
			createdAt: new Date().toISOString(),
		}

		setUserGroups((prev) => [newGroup, ...prev])
		toast.success(`Group "${groupName}" created successfully`)

		// Reset form and close dialog
		setGroupName("")
		setGroupDescription("")
		setGroupCoverImage(null)
		setIsGroupPrivate(false)
		setIsCreateGroupOpen(false)
	}

	function handleSelectGroup(group: Group) {
		setSelectedGroup(group)
		// Here you would fetch posts for this group
		toast.info(`Viewing posts from "${group.name}" group`)
		setShowGroups(false)
	}

	// Guard against user being null
	if (!user) {
		return <div className="p-8 text-center">Loading user profile...</div>
	}

	return (
		<>
			<div className="grid min-h-screen grid-cols-12 gap-6 bg-gradient-to-b from-blue-50/50 to-white px-8 py-8 transition-colors duration-300 dark:from-gray-900 dark:to-gray-950">
				{/* LEFT: PROFILE + MENU */}
				<div className="sticky top-20 col-span-3 space-y-8 self-start">
					{/* Profile */}

					<Card
						onClick={() => navigate("/me")}
						className="cursor-pointer border border-blue-100 bg-white shadow-md transition-all duration-300 hover:shadow-lg dark:border-blue-800 dark:bg-gray-800"
					>
						<CardHeader className="flex flex-row items-center gap-4">
							<img
								src={`http://localhost:8080/files/${user.avatarUrl}`}
								alt={user.name}
								className="h-12 w-12 rounded-full border border-gray-300 object-cover dark:border-gray-600"
								onError={(e) => {
									;(e.target as HTMLImageElement).src =
										"/placeholder.svg?height=48&width=48"
								}}
							/>
							<div>
								<h1 className="text-2xl font-bold">{user.name}</h1>
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">{user.excerpt}</p>
						</CardContent>
						<CardFooter className="grid grid-cols-2 divide-x divide-gray-200 border-t border-gray-200 text-center dark:divide-gray-700 dark:border-gray-700">
							<button className="flex flex-col items-center py-2 hover:text-primary">
								<span className="text-xl font-bold">{followers.length}</span>
								<span className="text-sm text-muted-foreground">Followers</span>
							</button>
							<button className="flex flex-col items-center py-2 hover:text-primary">
								<span className="text-xl font-bold">{followings.length}</span>
								<span className="text-sm text-muted-foreground">Following</span>
							</button>
						</CardFooter>
					</Card>

					{/* Sidebar Menu + Groups */}
					<div className="rounded-lg border border-blue-100 bg-white p-2 shadow-md backdrop-blur-sm transition-all duration-300 dark:border-blue-900/30 dark:bg-gray-800/90">
						<nav className="flex flex-col">
							<div
								className={cn(
									"flex h-12 cursor-pointer items-center gap-3 rounded-md px-4 transition-colors",
									!isOnFollowersTab && !isOnGroupsTab
										? "bg-blue-50 text-blue-600 dark:bg-blue-600 dark:text-white"
										: "hover:bg-blue-50 dark:hover:bg-blue-900/30",
								)}
								onClick={() => {
									setIsOnFollowersTab(false)
									setIsOnGroupsTab(false)
									setSelectedGroup(null)
								}}
							>
								<Home className="h-5 w-5" />
								<span className="text-sm font-medium">Home</span>
							</div>

							<div
								className={cn(
									"flex h-12 cursor-pointer items-center gap-3 rounded-md px-4 transition-colors",
									isOnFollowersTab
										? "bg-blue-50 text-blue-600 dark:bg-blue-600 dark:text-white"
										: "hover:bg-blue-50 dark:hover:bg-blue-900/30",
								)}
								onClick={() => {
									setIsOnFollowersTab(true)
									setIsOnGroupsTab(false)
									setSelectedGroup(null)
								}}
							>
								<Users className="h-5 w-5" />
								<span className="text-sm font-medium">Followers</span>
							</div>

							{/* Groups button */}
							<div
								className={cn(
									"flex h-12 cursor-pointer items-center gap-3 rounded-md px-4 transition-colors",
									isOnGroupsTab
										? "bg-blue-50 text-blue-600 dark:bg-blue-600 dark:text-white"
										: "hover:bg-blue-50 dark:hover:bg-blue-900/30",
								)}
								onClick={() => {
									setIsOnGroupsTab(true)
									setIsOnFollowersTab(false)
									setShowGroups(true)
								}}
							>
								<UserPlus className="h-5 w-5" />
								<span className="text-sm font-medium">Groups</span>
							</div>
						</nav>
					</div>
				</div>
				{/* CENTER: FEED */}
				<div className="col-span-6 space-y-6">
					{selectedGroup ? (
						<div className="mb-6">
							<div className="relative mb-4 h-40 w-full overflow-hidden rounded-lg">
								<img
									src={`http://localhost:8080/files/${selectedGroup.coverImage}`}
									alt={selectedGroup.name}
									className="h-full w-full object-cover"
									onError={(e) => {
										;(e.target as HTMLImageElement).src =
											"/placeholder.svg?height=160&width=600"
									}}
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
								<div className="absolute bottom-4 left-4 right-4">
									<h1 className="text-2xl font-bold text-white">
										{selectedGroup.name}
									</h1>
									<div className="flex items-center gap-2 text-sm text-white/80">
										<span>{selectedGroup.memberCount} members</span>
										<span>•</span>
										<span>
											{selectedGroup.isPrivate
												? "Private group"
												: "Public group"}
										</span>
									</div>
								</div>
								<button
									onClick={() => setSelectedGroup(null)}
									className="absolute right-3 top-3 rounded-full bg-black/30 p-1.5 text-white hover:bg-black/50"
								>
									<X className="h-5 w-5" />
								</button>
							</div>
							<p className="mb-6 text-gray-600 dark:text-gray-300">
								{selectedGroup.description}
							</p>
						</div>
					) : null}

					{/* Create Post Card */}
					<Card className="overflow-hidden border border-blue-100 shadow-md transition-all duration-300 hover:shadow-lg dark:border-blue-900/30">
						<CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 p-4 dark:from-blue-900/40 dark:to-indigo-900/40">
							<div className="flex items-center gap-3">
								<Avatar className="h-10 w-10 border-2 border-white shadow-sm">
									<AvatarImage
										src={`http://localhost:8080/files/${user.avatarUrl}`}
										alt={user.name}
										onError={(e) => {
											;(e.target as HTMLImageElement).src =
												"/placeholder.svg?height=40&width=40"
										}}
									/>
									<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
								</Avatar>
								<Dialog
									open={isCreatePostOpen}
									onOpenChange={setIsCreatePostOpen}
								>
									<DialogTrigger asChild>
										<button className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-left text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
											{selectedGroup
												? `Share something with ${selectedGroup.name}...`
												: "What's on your mind today?"}
										</button>
									</DialogTrigger>
									<DialogContent className="flex max-h-[90vh] flex-col overflow-hidden border bg-white p-0 dark:border-blue-900/30 dark:bg-gray-900 sm:max-w-xl">
										<DialogHeader className="border-b px-6 pt-6 dark:border-gray-700">
											<DialogTitle className="text-center text-xl font-bold">
												{selectedGroup
													? `Create Post in ${selectedGroup.name}`
													: "Create New Post"}
											</DialogTitle>
										</DialogHeader>

										<div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
											<div className="mt-4 flex items-center gap-3 border-b border-gray-200 pb-4 dark:border-gray-700">
												<Avatar className="h-10 w-10">
													<AvatarImage
														src={`http://localhost:8080/files/${user.avatarUrl}`}
														alt={user.name}
														onError={(e) => {
															;(e.target as HTMLImageElement).src =
																"/placeholder.svg?height=40&width=40"
														}}
													/>
													<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
												</Avatar>
												<div>
													<p className="font-medium">{user.name}</p>
													{!selectedGroup && (
														<div className="flex items-center gap-2 text-sm">
															<div className="flex items-center gap-1">
																<button
																	className={cn(
																		"flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
																		isPrivate
																			? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
																			: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
																	)}
																	onClick={() => setIsPrivate(!isPrivate)}
																>
																	{isPrivate ? (
																		<Lock className="h-3 w-3" />
																	) : (
																		<Globe className="h-3 w-3" />
																	)}
																	{isPrivate ? "Private" : "Public"}
																</button>
															</div>
														</div>
													)}
												</div>
											</div>

											<Tabs
												defaultValue="text"
												value={activeTab}
												onValueChange={setActiveTab}
												className="mt-4"
											>
												<TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
													<TabsTrigger
														value="text"
														className="flex items-center gap-2"
													>
														<span className="text-lg">📝</span> Text
													</TabsTrigger>
													<TabsTrigger
														value="photo"
														className="flex items-center gap-2"
													>
														<span className="text-lg">🖼️</span> Photo
													</TabsTrigger>
													<TabsTrigger
														value="video"
														className="flex items-center gap-2"
													>
														<span className="text-lg">🎬</span> Video
													</TabsTrigger>
												</TabsList>

												<TabsContent value="text" className="mt-4">
													<textarea
														className="min-h-32 w-full rounded-lg border border-gray-300 bg-transparent p-4 text-base focus:border-blue-500 focus:outline-none dark:border-gray-700"
														value={caption}
														onChange={(e) => setCaption(e.target.value)}
														placeholder={
															selectedGroup
																? `Share something with the group...`
																: "What's on your mind?"
														}
													/>
												</TabsContent>

												<TabsContent value="photo" className="mt-4">
													<div className="space-y-4">
														{!previewUrl ? (
															<div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 dark:border-gray-700 dark:bg-gray-800">
																<ImageIcon className="mb-2 h-10 w-10 text-gray-400" />
																<p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
																	Drag and drop an image, or click to select
																</p>
																<Input
																	id="photo-upload"
																	type="file"
																	accept="image/*"
																	onChange={handleFileChange}
																	className="hidden"
																/>
																<Label
																	htmlFor="photo-upload"
																	className="cursor-pointer"
																>
																	<Button variant="outline" className="mt-2">
																		Choose Image
																	</Button>
																</Label>
															</div>
														) : (
															<div className="relative">
																<img
																	src={previewUrl || "/placeholder.svg"}
																	alt="Preview"
																	className="w-full rounded-lg object-contain"
																	style={{ maxHeight: "300px" }}
																/>
																<button
																	onClick={() => {
																		setFile(null)
																		setPreviewUrl(null)
																	}}
																	className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
																>
																	<X className="h-5 w-5" />
																</button>
															</div>
														)}
														<textarea
															className="min-h-20 w-full rounded-lg border border-gray-300 bg-transparent p-4 text-base focus:border-blue-500 focus:outline-none dark:border-gray-700"
															value={caption}
															onChange={(e) => setCaption(e.target.value)}
															placeholder="Add a caption to your photo..."
														/>
													</div>
												</TabsContent>

												<TabsContent value="video" className="mt-4">
													<div className="space-y-4">
														{!previewUrl ? (
															<div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 dark:border-gray-700 dark:bg-gray-800">
																<Video className="mb-2 h-10 w-10 text-gray-400" />
																<p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
																	Drag and drop a video, or click to select
																</p>
																<Input
																	id="video-upload"
																	type="file"
																	accept="video/*"
																	onChange={handleFileChange}
																	className="hidden"
																/>
																<Label
																	htmlFor="video-upload"
																	className="cursor-pointer"
																>
																	<Button variant="outline" className="mt-2">
																		Choose Video
																	</Button>
																</Label>
															</div>
														) : (
															<div className="relative">
																{file && file.type.startsWith("video/") ? (
																	<video
																		src={previewUrl}
																		controls
																		className="w-full rounded-lg"
																		style={{ maxHeight: "300px" }}
																	/>
																) : (
																	<img
																		src={previewUrl || "/placeholder.svg"}
																		alt="Preview"
																		className="w-full rounded-lg object-contain"
																		style={{ maxHeight: "300px" }}
																	/>
																)}
																<button
																	onClick={() => {
																		setFile(null)
																		setPreviewUrl(null)
																	}}
																	className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
																>
																	<X className="h-5 w-5" />
																</button>
															</div>
														)}
														<textarea
															className="min-h-20 w-full rounded-lg border border-gray-300 bg-transparent p-4 text-base focus:border-blue-500 focus:outline-none dark:border-gray-700"
															value={caption}
															onChange={(e) => setCaption(e.target.value)}
															placeholder="Add a caption to your video..."
														/>
													</div>
												</TabsContent>
											</Tabs>

											{/* Additional options */}
											<div className="mt-4 space-y-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
												<div className="flex items-center gap-3">
													<MapPin className="h-5 w-5 text-gray-500" />
													<Input
														placeholder="Add location"
														value={location}
														onChange={(e) => setLocation(e.target.value)}
														className="flex-1 border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
													/>
												</div>

												<div className="flex items-center gap-3">
													<Smile className="h-5 w-5 text-gray-500" />
													<Input
														placeholder="How are you feeling?"
														value={mood}
														onChange={(e) => setMood(e.target.value)}
														className="flex-1 border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
													/>
												</div>

												{!selectedGroup && (
													<div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
														<div className="space-y-0.5">
															<Label
																htmlFor="private-toggle"
																className="dark:text-white"
															>
																Private Post
															</Label>
															<p className="text-xs text-gray-500 dark:text-gray-400">
																Only you will be able to see this post
															</p>
														</div>
														<Switch
															id="private-toggle"
															checked={isPrivate}
															onCheckedChange={setIsPrivate}
														/>
													</div>
												)}
											</div>
										</div>

										<div className="sticky bottom-0 flex justify-end gap-3 border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-950">
											<Button
												variant="outline"
												onClick={() => setIsCreatePostOpen(false)}
											>
												Cancel
											</Button>
											<Button
												className="bg-blue-600 hover:bg-blue-700"
												onClick={handleCreatePost}
												disabled={!caption.trim() && !file}
											>
												{selectedGroup
													? "Post to Group"
													: isPrivate
														? "Post Privately"
														: "Share Post"}
											</Button>
										</div>
									</DialogContent>
								</Dialog>
							</div>
						</CardHeader>
						<CardContent className="p-0">
							<div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-700">
								<button
									className="flex items-center justify-center gap-2 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
									onClick={() => {
										setIsCreatePostOpen(true)
										setActiveTab("text")
									}}
								>
									<span className="text-lg">📝</span>
									<span className="text-sm font-medium">Text</span>
								</button>
								<button
									className="flex items-center justify-center gap-2 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
									onClick={() => {
										setIsCreatePostOpen(true)
										setActiveTab("photo")
									}}
								>
									<span className="text-lg">🖼️</span>
									<span className="text-sm font-medium">Photo</span>
								</button>
								<button
									className="flex items-center justify-center gap-2 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
									onClick={() => {
										setIsCreatePostOpen(true)
										setActiveTab("video")
									}}
								>
									<span className="text-lg">🎬</span>
									<span className="text-sm font-medium">Video</span>
								</button>
							</div>
						</CardContent>
					</Card>

					{posts && posts.length > 0 ? (
						posts.map((post) => <PostUI postId={post} key={post} />)
					) : (
						<div className="mt-8 text-center text-gray-500">
							{selectedGroup
								? "No posts in this group yet. Be the first to post!"
								: "No posts to display. Follow more users or create your first post!"}
						</div>
					)}
				</div>
				{/* RIGHT: Recommended Friends */}
				<div className="col-span-3">
					<div className="sticky top-24 max-h-[80vh] overflow-hidden rounded-xl border border-blue-100 bg-white shadow-md transition-all duration-300 dark:border-blue-900/30 dark:bg-gray-800">
						<div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
							<h2 className="text-base font-semibold text-gray-800 dark:text-white">
								Recommended Friends
							</h2>
						</div>

						<div className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-thumb-rounded dark:scrollbar-thumb-gray-600 max-h-[64vh] overflow-y-auto px-4 py-2">
							{recommendedFriends?.length === 0 ? (
								<div className="text-sm italic text-gray-500 dark:text-gray-400">
									Oops, we didn't find any people matching your profile
								</div>
							) : (
								recommendedFriends?.map((fr) => (
									<div
										key={fr.id}
										className="mb-3 flex items-center justify-between gap-4 rounded-md px-2 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
									>
										<div className="flex items-center gap-3">
											<img
												src={`http://localhost:8080/files/${fr.avatarUrl}`}
												alt={`${fr.name}'s avatar`}
												className="h-8 w-8 rounded-full object-cover"
												onError={(e) => {
													;(e.target as HTMLImageElement).src =
														"/placeholder.svg?height=32&width=32"
												}}
											/>
											<a href={`/users/${fr.id}`}>
												<h1 className="text-sm font-medium hover:underline dark:text-white">
													{fr.name}
												</h1>
											</a>
										</div>
										<button
											onClick={() => handleFollow(fr.id, fr.name)}
											className="flex items-center gap-1 rounded-md bg-blue-100 px-3 py-1 text-sm text-blue-700 transition-colors duration-200 hover:bg-blue-200 dark:bg-blue-800/60 dark:text-blue-100 dark:hover:bg-blue-700/80"
										>
											<Plus className="h-4 w-4" />
											Follow
										</button>
									</div>
								))
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Scroll to Top Button */}
			<ScrollToTopButton />

			{/* Fixed Chat Button */}
			<button
				onClick={() => setShowChat(!showChat)}
				className="fixed bottom-6 right-6 z-50 flex h-14 w-14 transform items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-500 hover:to-blue-600 hover:shadow-blue-300/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95 dark:hover:shadow-blue-900/30"
				aria-label="Chat"
			>
				<span className="text-xl">{showChat ? "✕" : "💬"}</span>
			</button>

			{/* Mini Chat Popup */}
			{showChat && (
				<div className="fixed bottom-24 right-6 z-50 w-[320px] rounded-lg border border-blue-100 bg-white shadow-lg transition-all duration-300 dark:border-blue-900/30 dark:bg-gray-900">
					<div className="flex items-center justify-between border-b border-gray-200 p-3 dark:border-gray-700">
						<span className="text-sm font-semibold">Mini Chat</span>
						<button
							className="text-gray-500 hover:text-red-500"
							onClick={() => {
								setCurrentChatUser(null)
							}}
						>
							✕
						</button>
					</div>

					<div className="h-64 space-y-2 overflow-y-auto p-3 text-sm">
						{mutualFriends.length > 0 ? (
							mutualFriends.map((friend) => (
								<div
									key={friend.id}
									onClick={() => setCurrentChatUser(friend)}
									className={cn(
										"flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800",
										currentChatUser?.id === friend.id &&
											"bg-blue-50 dark:bg-blue-900",
									)}
								>
									<img
										src={`http://localhost:8080/files/${friend.avatarUrl}`}
										className="h-8 w-8 rounded-full"
										alt={friend.name}
										onError={(e) => {
											;(e.target as HTMLImageElement).src =
												"/placeholder.svg?height=32&width=32"
										}}
									/>
									<span className="text-sm font-medium text-gray-800 dark:text-white">
										{friend.name}
									</span>
								</div>
							))
						) : (
							<div className="italic text-gray-500 dark:text-gray-400">
								Không có bạn nào đã follow qua lại để chat.
							</div>
						)}
					</div>

					{currentChatUser && (
						<div className="border-t border-gray-200 px-3 py-2 text-sm font-medium text-blue-600 dark:border-gray-700 dark:text-blue-400">
							Đang trò chuyện với: {currentChatUser.name}
						</div>
					)}

					<div className="border-t border-gray-200 p-2 dark:border-gray-700">
						<form
							className="flex gap-2"
							onSubmit={(e) => {
								e.preventDefault()
								handleSendMessage()
							}}
						>
							<input
								type="text"
								placeholder="Nhắn gì đó..."
								className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black dark:border-gray-600 dark:bg-gray-800 dark:text-white"
								value={chatMessage}
								onChange={(e) => setChatMessage(e.target.value)}
								disabled={!currentChatUser}
							/>
							<Button
								type="submit"
								size="sm"
								className="bg-blue-600 hover:bg-blue-700"
								disabled={!currentChatUser || !chatMessage.trim()}
							>
								Send
							</Button>
						</form>
					</div>
				</div>
			)}

			{/*create mini chat*/}
			<MiniChat />

			{/* Groups Popup */}
			{showGroups && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300">
					<div className="max-h-[80vh] w-[90%] max-w-2xl overflow-y-auto rounded-lg border border-blue-100 bg-white p-6 shadow-xl transition-all duration-300 dark:border-blue-900/30 dark:bg-gray-900">
						<div className="mb-6 flex items-center justify-between">
							<h2 className="text-xl font-bold">Your Groups</h2>
							<div className="flex gap-2">
								<Button
									onClick={() => setIsCreateGroupOpen(true)}
									className="bg-blue-600 hover:bg-blue-700"
								>
									Create Group
								</Button>
								<button
									onClick={() => setShowGroups(false)}
									className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
								>
									<X className="h-5 w-5" />
								</button>
							</div>
						</div>

						<div className="space-y-4">
							{userGroups.length > 0 ? (
								userGroups.map((group) => (
									<div
										key={group.id}
										onClick={() => handleSelectGroup(group)}
										className="cursor-pointer rounded-lg border border-blue-100 bg-white p-4 shadow-sm transition-all duration-300 hover:bg-blue-50/50 hover:shadow-md dark:border-blue-900/30 dark:bg-gray-800 dark:hover:bg-gray-700/70"
									>
										<div className="flex items-start gap-4">
											<div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
												<img
													src={`http://localhost:8080/files/${group.coverImage}`}
													alt={group.name}
													className="h-full w-full object-cover"
													onError={(e) => {
														;(e.target as HTMLImageElement).src =
															"/placeholder.svg?height=64&width=64"
													}}
												/>
											</div>
											<div className="flex-1">
												<div className="flex items-center gap-2">
													<h3 className="font-semibold">{group.name}</h3>
													{group.isPrivate ? (
														<Lock className="h-4 w-4 text-gray-500" />
													) : (
														<Globe className="h-4 w-4 text-gray-500" />
													)}
												</div>
												<p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
													{group.description}
												</p>
												<div className="mt-2 text-xs text-gray-500">
													<span>{group.memberCount} members</span>
												</div>
											</div>
										</div>
									</div>
								))
							) : (
								<div className="text-center text-gray-500">
									You haven't joined any groups yet. Create your first group!
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Create Group Dialog */}
			<Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="text-xl font-bold">
							Create New Group
						</DialogTitle>
					</DialogHeader>
					<div className="grid gap-5 py-4">
						<div className="grid gap-2">
							<Label htmlFor="group-name">Group Name</Label>
							<Input
								id="group-name"
								value={groupName}
								onChange={(e) => setGroupName(e.target.value)}
								placeholder="Enter group name"
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="group-description">Description</Label>
							<textarea
								id="group-description"
								value={groupDescription}
								onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
									setGroupDescription(e.target.value)
								}
								placeholder="What is this group about?"
								className="min-h-24 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm"
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="group-cover">Cover Image</Label>
							<Input
								id="group-cover"
								type="file"
								accept="image/*"
								onChange={(e) =>
									e.target.files?.[0] && setGroupCoverImage(e.target.files[0])
								}
							/>
						</div>

						{groupCoverImage && (
							<div className="mt-2 overflow-hidden rounded-lg border border-gray-200">
								<img
									src={
										URL.createObjectURL(groupCoverImage) || "/placeholder.svg"
									}
									alt="Preview"
									className="h-48 w-full object-cover"
								/>
							</div>
						)}

						<div className="space-y-3">
							<Label>Privacy Setting</Label>
							<div className="space-y-2">
								<div className="flex items-center space-x-2">
									<input
										type="radio"
										id="public"
										name="privacy"
										value="public"
										checked={!isGroupPrivate}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setIsGroupPrivate(e.target.value !== "public")
										}
										className="h-4 w-4"
									/>
									<Label
										htmlFor="public"
										className="flex items-center gap-2 font-normal"
									>
										<Globe className="h-4 w-4" />
										Public
										<span className="text-xs text-gray-500">
											Anyone can see and join this group
										</span>
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<input
										type="radio"
										id="private"
										name="privacy"
										value="private"
										checked={isGroupPrivate}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setIsGroupPrivate(e.target.value === "private")
										}
										className="h-4 w-4"
									/>
									<Label
										htmlFor="private"
										className="flex items-center gap-2 font-normal"
									>
										<Lock className="h-4 w-4" />
										Private
										<span className="text-xs text-gray-500">
											Only members can see posts
										</span>
									</Label>
								</div>
							</div>
						</div>
						{/*
						<Button
							className="mt-2 w-full bg-blue-600 hover:bg-blue-700"
							onClick={handleCreateGroup}
						>
							Create Group
						</Button>
						*/}
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}
