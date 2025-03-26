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

export default function MePage() {
	const { user } = useUser()
	const { followers, followings } = useNewsfeed()
	const [caption, setCaption] = useState("")
	const [file, setFile] = useState<File | null>(null)
	const [open, setOpen] = useState(false)
	const [posts, setPosts] = useState<Post[]>([])
	const [followersOpen, setFollowersOpen] = useState(false)
	const [followingsOpen, setFollowingsOpen] = useState(false)

	const handleCreatePost = async () => {
		createPostApi(caption, file)
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
						<Button size="lg">Wanting to share a story? Create a Post!</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Create a New Post</DialogTitle>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label htmlFor="caption">Caption</Label>
								<Input
									id="caption"
									placeholder="What's on your mind?"
									value={caption}
									onChange={(e) => setCaption(e.target.value)}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="file">Media (Optional)</Label>
								<Input
									id="file"
									type="file"
									accept="image/*,video/*"
									onChange={(e) => setFile(e.target.files?.[0] || null)}
								/>
							</div>
							{file && <img src={URL.createObjectURL(file)} />}
							<Button
								className="mt-4"
								onClick={handleCreatePost}
								disabled={!caption.trim()}
							>
								Create Post
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
