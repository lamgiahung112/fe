"use client"

import useUser from "@/stores/user-store"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { useEffect, useState } from "react"
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
import createPostApi from "@/apis/create_post"
import { toast } from "react-toastify"
import type { Post } from "@/types/post"
import postsByUserId from "@/apis/posts_by_user"
import { useNavigate } from "react-router-dom"
import PostUI from "@/components/post"
import useNewsfeed from "@/stores/newsfeed-store"
import type { User } from "@/types/user"
import { Switch } from "@/components/ui/switch"
import { Camera, Edit, ImageIcon, PlusCircle, X } from "lucide-react"
import updateProfileApi from "@/apis/update_profile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MePage() {
	const { user, getDetail } = useUser()
	const { followers, followings } = useNewsfeed()
	const [caption, setCaption] = useState("")
	const [file, setFile] = useState<File | null>(null)
	const [open, setOpen] = useState(false)
	const [posts, setPosts] = useState<Post[]>([])
	const [followersOpen, setFollowersOpen] = useState(false)
	const [followingsOpen, setFollowingsOpen] = useState(false)
	const [isPrivate, setIsPrivate] = useState(false)

	const [updateUserOpen, setUpdateUserOpen] = useState(false)
	const [excerpt, setExcerpt] = useState("")
	const [name, setName] = useState("")
	const [avatar, setAvatar] = useState<File | null>(null)
	const [previewUrl, setPreviewUrl] = useState<string | null>(null)
	const [activeTab, setActiveTab] = useState("posts")

	const fetchPosts = () => {
		if (!user?.id) return
		postsByUserId(user.id)
			.then(setPosts)
			.catch(() => toast.error("Failed to load posts"))
	}

	const handleCreatePost = () => {
		if (!caption.trim() && !file) {
			toast.error("Please add a caption or media to your post")
			return
		}

		createPostApi(caption, file, isPrivate)
			.then(() => {
				toast.success("Post created successfully")
				fetchPosts()
			})
			.catch(() => toast.error("Failed to create post"))
			.finally(() => {
				setCaption("")
				setFile(null)
				setPreviewUrl(null)
				setIsPrivate(false)
				setOpen(false)
				setActiveTab("posts")
			})
	}

	const handleUpdateProfile = () => {
		if (!user) return
		if (name === "") {
			toast.error("Name is required")
			return
		}

		// Only update fields that have been changed
		const updatedName = name || user.name
		const updatedExcerpt = excerpt !== "" ? excerpt : user.excerpt
		const updatedAvatarUrl = user.avatarUrl

		updateProfileApi(updatedName, updatedExcerpt, updatedAvatarUrl, avatar)
			.then(() => {
				toast.success("Profile updated successfully")
				getDetail()
			})
			.catch(() => toast.error("Update failed"))
			.finally(() => {
				setName("")
				setExcerpt("")
				setAvatar(null)
				setUpdateUserOpen(false)
			})
	}

	// Pre-fill form fields with existing user data
	useEffect(() => {
		if (updateUserOpen && user) {
			setName(user.name || "")
			setExcerpt(user.excerpt || "")
		}
	}, [updateUserOpen, user])

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

	useEffect(() => {
		fetchPosts()
	}, [user?.id])

	if (!user) {
		return (
			<div className="flex h-[70vh] items-center justify-center">
				<div className="text-center">
					<div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
					<p className="text-muted-foreground">Loading profile...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="container mx-auto max-w-4xl px-4 py-8">
			<Card className="overflow-hidden border-0 bg-gradient-to-b from-background to-muted/20 shadow-md transition-all duration-300 hover:shadow-lg">
				<CardHeader className="relative p-0">
					{/* Profile Cover */}
					<div className="h-48 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 transition-colors duration-300 dark:from-blue-950/40 dark:via-purple-950/40 dark:to-pink-950/40"></div>

					{/* Profile Avatar */}
					<div className="absolute -bottom-16 left-8 h-32 w-32 overflow-hidden rounded-full border-4 border-background shadow-lg transition-transform duration-300 hover:scale-105">
						<img
							src={`http://localhost:8080/files/${user.avatarUrl}`}
							alt="avatar"
							className="h-full w-full object-cover"
							onError={(e) => {
								;(e.target as HTMLImageElement).src =
									"/placeholder.svg?height=128&width=128"
							}}
						/>
					</div>

					{/* Edit Profile Dialog */}
					<Dialog open={updateUserOpen} onOpenChange={setUpdateUserOpen}>
						<DialogTrigger asChild>
							<Button
								size="icon"
								variant="outline"
								className="absolute right-4 top-4 bg-background/80 backdrop-blur-sm transition-all duration-200 hover:bg-background/90"
								onClick={() => setUpdateUserOpen(true)}
							>
								<Edit size={18} />
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-md">
							<DialogHeader>
								<DialogTitle className="text-xl">Update Profile</DialogTitle>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="space-y-1">
									<Label htmlFor="name" className="flex items-center gap-1">
										Name <span className="text-red-500">*</span>
									</Label>
									<Input
										id="name"
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Your name"
										required
									/>
									{name === "" && (
										<p className="mt-1 text-xs text-red-500">
											Name is required
										</p>
									)}
								</div>
								<div className="space-y-1">
									<Label htmlFor="excerpt">Bio</Label>
									<textarea
										id="excerpt"
										value={excerpt}
										onChange={(e) => setExcerpt(e.target.value)}
										className="min-h-[80px] w-full rounded-md border px-3 py-2 text-sm dark:bg-gray-900"
										placeholder="Say something about yourself"
									/>
								</div>
								<div className="space-y-1">
									<Label htmlFor="avatar" className="mb-2 block">
										Avatar
									</Label>
									<div className="flex items-center gap-4">
										{avatar ? (
											<div className="relative h-16 w-16 overflow-hidden rounded-full border">
												<img
													src={
														URL.createObjectURL(avatar) || "/placeholder.svg"
													}
													alt="Preview"
													className="h-full w-full object-cover"
												/>
											</div>
										) : user?.avatarUrl ? (
											<div className="relative h-16 w-16 overflow-hidden rounded-full border">
												<img
													src={`http://localhost:8080/files/${user.avatarUrl}`}
													alt="Current avatar"
													className="h-full w-full object-cover"
													onError={(e) => {
														;(e.target as HTMLImageElement).src =
															"/placeholder.svg?height=64&width=64"
													}}
												/>
											</div>
										) : null}
										<div className="flex-1">
											<label
												htmlFor="avatar-upload"
												className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-4 py-2 transition-colors hover:bg-muted/50"
											>
												<Camera size={18} />
												<span>{avatar ? "Change image" : "Choose image"}</span>
											</label>
											<Input
												id="avatar-upload"
												type="file"
												accept="image/*"
												className="hidden"
												onChange={(e) =>
													e.target.files?.[0] && setAvatar(e.target.files[0])
												}
											/>
										</div>
									</div>
								</div>
								<Button
									onClick={handleUpdateProfile}
									className="w-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-300 hover:from-blue-500 hover:to-blue-600"
									disabled={name === ""}
								>
									Update Profile
								</Button>
							</div>
						</DialogContent>
					</Dialog>
				</CardHeader>
				<CardContent className="px-8 pb-6 pt-20">
					<div className="flex flex-col gap-1">
						<h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
						<p className="text-muted-foreground">
							{user.excerpt || "No bio yet"}
						</p>
					</div>
				</CardContent>
				<CardFooter className="px-0">
					{/* Profile Stats */}
					<div className="grid w-full grid-cols-2 divide-x border-t text-center dark:divide-gray-700">
						<button
							onClick={() => setFollowersOpen(true)}
							className="group flex flex-col items-center py-4 transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
						>
							<div className="text-xl font-semibold transition-transform duration-200 group-hover:scale-110">
								{followers.length}
							</div>
							<div className="text-sm text-muted-foreground transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
								Followers
							</div>
						</button>
						<button
							onClick={() => setFollowingsOpen(true)}
							className="group flex flex-col items-center py-4 transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
						>
							<div className="text-xl font-semibold transition-transform duration-200 group-hover:scale-110">
								{followings.length}
							</div>
							<div className="text-sm text-muted-foreground transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
								Following
							</div>
						</button>
					</div>
				</CardFooter>
			</Card>

			<UserListDialog
				title="Followers"
				users={followers}
				isOpen={followersOpen}
				setIsOpen={setFollowersOpen}
			/>
			<UserListDialog
				title="Following"
				users={followings}
				isOpen={followingsOpen}
				setIsOpen={setFollowingsOpen}
			/>

			<div className="mt-8">
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="mb-6 grid w-full grid-cols-2 rounded-lg bg-muted/50 p-1">
						<TabsTrigger
							value="posts"
							className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
						>
							My Posts
						</TabsTrigger>
						<TabsTrigger
							value="create"
							className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
						>
							Create Post
						</TabsTrigger>
					</TabsList>

					<TabsContent value="posts" className="space-y-6">
						{posts.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-16 text-center">
								<div className="mb-4 rounded-full bg-blue-100 p-4 dark:bg-blue-900/30">
									<PlusCircle
										size={32}
										className="text-blue-600 dark:text-blue-400"
									/>
								</div>
								<h3 className="mb-2 text-lg font-medium">No posts yet</h3>
								<p className="mb-6 max-w-md text-muted-foreground">
									Share your thoughts, photos, and experiences with your
									followers
								</p>
								<Button
									onClick={() => setActiveTab("create")}
									className="gap-2 bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-300 hover:from-blue-500 hover:to-blue-600"
								>
									<PlusCircle size={16} />
									Create your first post
								</Button>
							</div>
						) : (
							<div className="space-y-6">
								{posts.map((post) => (
									<PostUI key={post.id} postId={post.id} />
								))}
							</div>
						)}
					</TabsContent>

					<TabsContent value="create">
						<Card className="overflow-hidden border shadow-sm">
							<CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
								<h3 className="text-lg font-medium">Share your story</h3>
							</CardHeader>
							<CardContent className="p-6">
								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="post-caption">Caption</Label>
										<textarea
											id="post-caption"
											value={caption}
											onChange={(e) => setCaption(e.target.value)}
											placeholder="What's on your mind?"
											className="min-h-[120px] w-full rounded-md border px-3 py-2 text-sm dark:bg-gray-900"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="post-media">Media (optional)</Label>
										<div className="flex items-center gap-4">
											{previewUrl && (
												<div className="relative h-24 w-24 overflow-hidden rounded-md border">
													{file?.type.startsWith("image/") ? (
														<img
															src={previewUrl || "/placeholder.svg"}
															alt="Preview"
															className="h-full w-full object-cover"
														/>
													) : file?.type.startsWith("video/") ? (
														<video
															src={previewUrl}
															className="h-full w-full object-cover"
															controls
														/>
													) : null}
													<button
														onClick={() => {
															setFile(null)
															setPreviewUrl(null)
														}}
														className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
													>
														<X className="h-3 w-3" />
													</button>
												</div>
											)}
											<div className="flex-1">
												<label
													htmlFor="post-media"
													className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-4 py-2 transition-colors hover:bg-muted/50"
												>
													<ImageIcon size={18} />
													<span>
														{file ? "Change media" : "Add photo or video"}
													</span>
												</label>
												<Input
													id="post-media"
													type="file"
													accept="image/*,video/*"
													className="hidden"
													onChange={(e) =>
														e.target.files?.[0] && setFile(e.target.files[0])
													}
												/>
											</div>
										</div>
									</div>
									<div className="flex items-center justify-between rounded-md bg-muted/50 p-4">
										<div>
											<Label
												htmlFor="private-toggle"
												className="text-sm font-medium"
											>
												Private Post
											</Label>
											<p className="text-xs text-muted-foreground">
												Only you will be able to see this post
											</p>
										</div>
										<Switch
											id="private-toggle"
											checked={isPrivate}
											onCheckedChange={setIsPrivate}
										/>
									</div>
								</div>
							</CardContent>
							<CardFooter className="flex justify-end border-t bg-gradient-to-r from-blue-50/50 to-indigo-50/50 pt-4 dark:from-blue-950/20 dark:to-indigo-950/20">
								<Button
									onClick={handleCreatePost}
									className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 transition-all duration-300 hover:from-blue-500 hover:to-blue-600"
									disabled={!caption.trim() && !file}
								>
									{isPrivate ? "Create Private Post" : "Share Post"}
								</Button>
							</CardFooter>
						</Card>
					</TabsContent>
				</Tabs>
			</div>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Create New Post</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-1">
							<Label htmlFor="caption">Caption</Label>
							<textarea
								id="caption"
								value={caption}
								onChange={(e) => setCaption(e.target.value)}
								placeholder="What's on your mind?"
								className="min-h-[120px] w-full rounded-md border px-3 py-2 text-sm dark:bg-gray-900"
							/>
						</div>
						<div className="space-y-1">
							<Label htmlFor="file">Media (optional)</Label>
							<div className="flex items-center gap-4">
								{previewUrl && (
									<div className="relative h-16 w-16 overflow-hidden rounded-md border">
										{file?.type.startsWith("image/") ? (
											<img
												src={previewUrl || "/placeholder.svg"}
												alt="Preview"
												className="h-full w-full object-cover"
											/>
										) : file?.type.startsWith("video/") ? (
											<video
												src={previewUrl}
												className="h-full w-full object-cover"
											/>
										) : null}
										<button
											onClick={() => {
												setFile(null)
												setPreviewUrl(null)
											}}
											className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
										>
											<X className="h-3 w-3" />
										</button>
									</div>
								)}
								<div className="flex-1">
									<label
										htmlFor="file"
										className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-4 py-2 transition-colors hover:bg-muted/50"
									>
										<Camera size={18} />
										<span>{file ? "Change media" : "Add photo or video"}</span>
									</label>
									<Input
										id="file"
										type="file"
										accept="image/*,video/*"
										className="hidden"
										onChange={(e) =>
											e.target.files?.[0] && setFile(e.target.files[0])
										}
									/>
								</div>
							</div>
						</div>
						<div className="flex items-center justify-between rounded-md bg-muted/50 p-4">
							<div>
								<Label
									htmlFor="dialog-private-toggle"
									className="text-sm font-medium"
								>
									Private Post
								</Label>
								<p className="text-xs text-muted-foreground">
									Only you will be able to see this post
								</p>
							</div>
							<Switch
								id="dialog-private-toggle"
								checked={isPrivate}
								onCheckedChange={setIsPrivate}
							/>
						</div>
						<Button
							onClick={handleCreatePost}
							className="w-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-300 hover:from-blue-500 hover:to-blue-600"
							disabled={!caption.trim() && !file}
						>
							{isPrivate ? "Create Private Post" : "Share Post"}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}

function UserListDialog({
	title,
	users,
	isOpen,
	setIsOpen,
}: {
	title: string
	users: User[]
	isOpen: boolean
	setIsOpen: (open: boolean) => void
}) {
	const navigate = useNavigate()

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<div className="max-h-[60vh] overflow-y-auto">
					{users.length === 0 ? (
						<div className="py-8 text-center">
							<p className="mb-2 text-muted-foreground">No users to display</p>
							<p className="text-xs text-muted-foreground/70">
								{title === "Followers"
									? "When people follow you, they'll appear here"
									: "People you follow will appear here"}
							</p>
						</div>
					) : (
						<div className="space-y-1 py-2">
							{users.map((user) => (
								<div
									key={user.id}
									className="flex cursor-pointer items-center gap-3 rounded-md p-3 transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
									onClick={() => {
										navigate(`/users/${user.id}`)
										setIsOpen(false)
									}}
								>
									<img
										src={`http://localhost:8080/files/${user.avatarUrl}`}
										alt={user.name}
										className="h-10 w-10 rounded-full border object-cover"
										onError={(e) => {
											;(e.target as HTMLImageElement).src =
												"/placeholder.svg?height=40&width=40"
										}}
									/>
									<span className="font-medium text-foreground">
										{user.name}
									</span>
								</div>
							))}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}
