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
import { Camera, Edit, PlusCircle } from "lucide-react"
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

	const fetchPosts = () => {
		if (!user?.id) return
		postsByUserId(user.id)
			.then(setPosts)
			.catch(() => toast.error("Failed to load posts"))
	}

	const handleCreatePost = () => {
		createPostApi(caption, file, isPrivate)
			.then(() => toast.success("Post created"))
			.catch(() => toast.error("Failed to post"))
			.finally(() => {
				setCaption("")
				setFile(null)
				setOpen(false)
				fetchPosts()
			})
	}

	const handleUpdateProfile = () => {
		if (!user) return
		updateProfileApi(name, excerpt, user.avatarUrl, avatar)
			.then(() => toast.success("Profile updated"))
			.catch(() => toast.error("Update failed"))
			.finally(() => {
				setName("")
				setExcerpt("")
				setAvatar(null)
				setUpdateUserOpen(false)
				getDetail()
			})
	}

	useEffect(() => {
		fetchPosts()
	}, [])

	return (
		<div className="container mx-auto max-w-4xl px-4 py-8">
			<Card className="overflow-hidden border-0 bg-gradient-to-b from-background to-muted/20 shadow-md">
				<CardHeader className="relative p-0">
					<div className="h-32 bg-gradient-to-r from-rose-100 to-teal-100 dark:from-rose-950/30 dark:to-teal-950/30"></div>
					<div className="absolute -bottom-12 left-8 h-24 w-24 overflow-hidden rounded-full border-4 border-background shadow-lg">
						<img
							src={`http://localhost:8080/files/${user!.avatarUrl}`}
							alt="avatar"
							className="h-full w-full object-cover"
						/>
					</div>
					<Dialog open={updateUserOpen} onOpenChange={setUpdateUserOpen}>
						<DialogTrigger asChild>
							<Button
								size="icon"
								variant="ghost"
								className="absolute right-4 top-4 bg-background/80 backdrop-blur-sm hover:bg-background/90"
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
									<Label htmlFor="name">Name</Label>
									<Input
										id="name"
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Your name"
									/>
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
										{avatar && (
											<div className="relative h-16 w-16 overflow-hidden rounded-full border">
												<img
													src={
														URL.createObjectURL(avatar) || "/placeholder.svg"
													}
													alt="Preview"
													className="h-full w-full object-cover"
												/>
											</div>
										)}
										<div className="flex-1">
											<label
												htmlFor="avatar-upload"
												className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-4 py-2 transition-colors hover:bg-muted/50"
											>
												<Camera size={18} />
												<span>Choose image</span>
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
								<Button onClick={handleUpdateProfile} className="w-full">
									Update Profile
								</Button>
							</div>
						</DialogContent>
					</Dialog>
				</CardHeader>
				<CardContent className="px-8 pb-6 pt-16">
					<div className="flex flex-col gap-1">
						<h1 className="text-2xl font-bold text-foreground">{user!.name}</h1>
						<p className="text-muted-foreground">
							{user!.excerpt || "No bio yet"}
						</p>
					</div>
				</CardContent>
				<CardFooter className="px-0">
					<div className="grid w-full grid-cols-2 divide-x border-t text-center dark:divide-gray-700">
						<button
							onClick={() => setFollowersOpen(true)}
							className="py-4 transition-colors hover:bg-muted/50"
						>
							<div className="text-xl font-semibold">{followers.length}</div>
							<div className="text-sm text-muted-foreground">Followers</div>
						</button>
						<button
							onClick={() => setFollowingsOpen(true)}
							className="py-4 transition-colors hover:bg-muted/50"
						>
							<div className="text-xl font-semibold">{followings.length}</div>
							<div className="text-sm text-muted-foreground">Following</div>
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
				<Tabs defaultValue="posts" className="w-full">
					<TabsList className="mb-6 grid w-full grid-cols-2">
						<TabsTrigger value="posts">My Posts</TabsTrigger>
						<TabsTrigger value="create">Create Post</TabsTrigger>
					</TabsList>
					<TabsContent value="posts">
						<div className="space-y-6">
							{posts.length === 0 ? (
								<div className="py-12 text-center">
									<p className="mb-4 text-muted-foreground">
										You haven't shared any posts yet
									</p>
									<Button
										onClick={() => setOpen(true)}
										variant="outline"
										className="gap-2"
									>
										<PlusCircle size={16} />
										Create your first post
									</Button>
								</div>
							) : (
								posts.map((post) => <PostUI key={post.id} postId={post.id} />)
							)}
						</div>
					</TabsContent>
					<TabsContent value="create">
						<Card className="border shadow-sm">
							<CardHeader>
								<h3 className="text-lg font-medium">Share your story</h3>
							</CardHeader>
							<CardContent>
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
											{file && (
												<div className="relative h-20 w-20 overflow-hidden rounded-md border">
													<img
														src={
															URL.createObjectURL(file) || "/placeholder.svg"
														}
														alt="Preview"
														className="h-full w-full object-cover"
													/>
												</div>
											)}
											<div className="flex-1">
												<label
													htmlFor="post-media"
													className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-4 py-2 transition-colors hover:bg-muted/50"
												>
													<Camera size={18} />
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
							<CardFooter className="flex justify-end border-t pt-4">
								<Button onClick={handleCreatePost} className="px-6">
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
								{file && (
									<div className="relative h-16 w-16 overflow-hidden rounded-md border">
										<img
											src={URL.createObjectURL(file) || "/placeholder.svg"}
											alt="Preview"
											className="h-full w-full object-cover"
										/>
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
						<Button onClick={handleCreatePost} className="w-full">
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
									className="flex cursor-pointer items-center gap-3 rounded-md p-3 transition-colors hover:bg-muted"
									onClick={() => {
										navigate(`/users/${user.id}`)
										setIsOpen(false)
									}}
								>
									<img
										src={`http://localhost:8080/files/${user.avatarUrl}`}
										alt={user.name}
										className="h-10 w-10 rounded-full border object-cover"
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
