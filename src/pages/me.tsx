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
import { Post } from "@/types/post"
import postsByUserId from "@/apis/posts_by_user"
import { useNavigate } from "react-router-dom"
import PostUI from "@/components/post"
import useNewsfeed from "@/stores/newsfeed-store"
import { User } from "@/types/user"
import { Switch } from "@/components/ui/switch.tsx"
import { MoreVertical } from "lucide-react"
import updateProfileApi from "@/apis/update_profile.ts"

export default function MePage() {
	const { user, getDetail } = useUser()
	const { followers, followings } = useNewsfeed()
	const [caption, setCaption] = useState("")
	const [file, setFile] = useState<File | null>(null)
	const [open, setOpen] = useState(false)
	const [posts, setPosts] = useState<Post[]>([])
	const [followersOpen, setFollowersOpen] = useState(false)
	const [followingsOpen, setFollowingsOpen] = useState(false)
	const [isPrivate, setIsPrivate] = useState<boolean>(false)

	const [updateUserOpen, setUpdateUserOpen] = useState<boolean>(false)
	const [excerpt, setExcerpt] = useState<string>("")
	const [name, setName] = useState("")
	const [avatar, setAvatar] = useState<File | null>(null)

	const handleCreatePost = async () => {
		createPostApi(caption, file, isPrivate)
			.then(() => {
				toast.success("Successfully created post")
			})
			.catch(() => {
				toast.error("Create post failed")
			})
			.finally(() => {
				setCaption("")
				setFile(null)
				setOpen(false)
				fetchPosts()
			})
	}

	const handleUpdateProfile = async () => {
		if (!user) {
			return
		}
		updateProfileApi(name, excerpt, user.avatarUrl, avatar)
			.then(() => {
				toast.success("Successfully update profile")
			})
			.catch(() => {
				toast.error("Update profile failed")
			})
			.finally(() => {
				setName("")
				setAvatar(null)
				setUpdateUserOpen(false)
				setExcerpt("")
				getDetail()
			})
	}

	const fetchPosts = () => {
		if (!user || !user.id) {
			return
		}
		postsByUserId(user.id)
			.then(setPosts)
			.catch(() => toast.error("Failed to query user posts"))
	}

	useEffect(() => {
		fetchPosts()
	}, [])

	return (
		<div className="container py-8">
			<Card className="mx-auto max-w-2xl">
				<CardHeader className="flex flex-row items-center gap-4">
					<img
						src={`http://localhost:8080/files/${user!.avatarUrl}`}
						alt={`${user!.name}'s avatar`}
						className="h-20 w-20 rounded-full"
					/>
					<div>
						<h1 className="text-2xl font-bold">{user!.name}</h1>
					</div>
					<Dialog open={updateUserOpen} onOpenChange={setUpdateUserOpen}>
						<DialogTrigger asChild>
							<button
								className="text-muted-foreground transition-colors hover:text-foreground"
								onClick={() => {
									setUpdateUserOpen(true)
								}}
							>
								<MoreVertical size={20} />
							</button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-md">
							<DialogHeader>
								<DialogTitle className="text-xl font-bold">Update your profile</DialogTitle>
							</DialogHeader>
							<div className="grid gap-5 py-4">
								<div className="grid gap-2">
									<Label htmlFor="excerpt" className="text-sm font-medium">
										Excerpt
									</Label>
									<textarea
										id="excerpt"
										placeholder="Your excerpt"
										className="min-h-24 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
										value={excerpt}
										onChange={(e) => setExcerpt(e.target.value)}
									/>
								</div>

								<div className="grid gap-2">
									<Label htmlFor="name" className="text-sm font-medium">
										Name
									</Label>
									<textarea
										id="name"
										placeholder="Your name"
										className="min-h-24 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
										value={name}
										onChange={(e) => setName(e.target.value)}
									/>
								</div>

								<div className="grid gap-2">
									<Label htmlFor="file" className="text-sm font-medium">
										Avatar (Optional)
									</Label>
									<Input
										id="file"
										type="file"
										accept="image/*,video/*"
										className="cursor-pointer file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
										onChange={(e) => {
											if (e.target.files?.length) {
												setAvatar(e.target.files[0])
											}
										}}
									/>
								</div>

								{avatar && (
									<div className="mt-2 overflow-hidden rounded-lg border border-gray-200">
										<img
											src={URL.createObjectURL(avatar)}
											alt="Preview"
											className="h-16 w-16 rounded-full object-cover"
										/>
									</div>
								)}
								<Button
									className="mt-2 w-full bg-blue-600 hover:bg-blue-700"
									onClick={handleUpdateProfile}
								>
									Update
								</Button>
							</div>
						</DialogContent>
					</Dialog>

				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">{user!.excerpt}</p>
				</CardContent>
				<CardFooter className="flex justify-center gap-8 border-t pt-4">
					<button
						onClick={() => setFollowersOpen(true)}
						className="flex flex-col items-center transition-colors hover:text-primary"
					>
						<span className="text-xl font-bold">{followers.length}</span>
						<span className="text-sm text-muted-foreground">Followers</span>
					</button>
					<button
						onClick={() => setFollowingsOpen(true)}
						className="flex flex-col items-center transition-colors hover:text-primary"
					>
						<span className="text-xl font-bold">{followings.length}</span>
						<span className="text-sm text-muted-foreground">Following</span>
					</button>
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
			<div className="mt-8 text-center">
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button size="lg" className="bg-blue-600 hover:bg-blue-700">
							Share your story
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle className="text-xl font-bold">Create New Post</DialogTitle>
						</DialogHeader>
						<div className="grid gap-5 py-4">
							<div className="grid gap-2">
								<Label htmlFor="caption" className="text-sm font-medium">
									Caption
								</Label>
								<textarea
									id="caption"
									placeholder="What's on your mind?"
									className="min-h-24 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
									value={caption}
									onChange={(e) => setCaption(e.target.value)}
								/>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="file" className="text-sm font-medium">
									Media (Optional)
								</Label>
								<Input
									id="file"
									type="file"
									accept="image/*,video/*"
									className="cursor-pointer file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
									onChange={(e) => {
										if (e.target.files?.length) {
											setFile(e.target.files[0])
										}
									}}
								/>
							</div>

							{file && (
								<div className="mt-2 overflow-hidden rounded-lg border border-gray-200">
									<img
										src={URL.createObjectURL(file)}
										alt="Preview"
										className="h-48 w-full object-cover"
									/>
								</div>
							)}

							<div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
								<div className="space-y-0.5">
									<Label htmlFor="private-toggle" className="text-sm font-medium">
										Private Post
									</Label>
									<p className="text-xs text-gray-500">
										Only you will be able to see this post
									</p>
								</div>
								<Switch
									id="private-toggle"
									checked={isPrivate}
									onCheckedChange={(checked) => setIsPrivate(checked)}
								/>
							</div>

							<Button
								className="mt-2 w-full bg-blue-600 hover:bg-blue-700"
								onClick={handleCreatePost}
							>
								{isPrivate ? "Create Private Post" : "Share Post"}
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{/* Posts Section */}
			<div className="mx-auto mt-8 max-w-2xl space-y-6">
				{posts?.map((post) => (
					<PostUI postId={post.id} key={post.id} />
				))}
			</div>
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
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<div className="max-h-[60vh] overflow-y-auto">
					{users.length === 0 ? (
						<p className="py-4 text-center text-muted-foreground">
							No users to display
						</p>
					) : (
						<div className="space-y-4 py-4">
							{users.map((user) => (
								<div
									key={user.id}
									className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-accent"
									onClick={() => {
										navigate(`/users/${user.id}`)
										setIsOpen(false)
									}}
								>
									<img
										src={`http://localhost:8080/files/${user.avatarUrl}`}
										alt={`${user.name}'s avatar`}
										className="h-10 w-10 rounded-full object-cover"
									/>
									<span className="font-medium">{user.name}</span>
								</div>
							))}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}
