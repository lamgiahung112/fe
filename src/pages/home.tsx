import PostUI from "@/components/post"
import useNewsfeed from "@/stores/newsfeed-store"
import { useEffect, useState } from "react"
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card.tsx"
import useUser from "@/stores/user-store.ts"
import { cn } from "@/lib/utils.ts"
import { Home, Plus, Users } from "lucide-react"
import { User } from "@/types/user.ts"
import getRecommendedFriends from "@/apis/get_recommended_friend.ts"
import followApi from "@/apis/follow.ts"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Label } from "@/components/ui/label.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Switch } from "@/components/ui/switch.tsx"
import createPostApi from "@/apis/create_post.ts"
import { ftruncate } from "fs"

export default function HomePage() {
	const { posts, reset, get, getForFollowers, followers, followings } =
		useNewsfeed()
	const { user } = useUser()
	const [hasReachedBottom, setHasReachedBottom] = useState(false)
	const [isOnFollowersTab, setIsOnFollowersTab] = useState(false)
	const [recommendedFriends, setRecommendedFriends] = useState<User[]>([])
	const navigate = useNavigate()
	const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
	const [caption, setCaption] = useState("")
	const [file, setFile] = useState<File | null>(null)
	const [isPrivate, setIsPrivate] = useState<boolean>(false)

	useEffect(() => {
		getRecommendedFriends().then(setRecommendedFriends)
	}, [])

	useEffect(() => {
		reset()
		const handleScroll = () => {
			const scrolledToBottom =
				window.innerHeight + window.scrollY >=
				document.documentElement.scrollHeight - 10
			setHasReachedBottom(scrolledToBottom)
		}
		window.addEventListener("scroll", handleScroll)
		return () => window.removeEventListener("scroll", handleScroll)
	}, [])

	useEffect(() => {
		if (hasReachedBottom) {
			if (isOnFollowersTab) {
				getForFollowers(false)
			} else {
				get(false)
			}
		}
	}, [hasReachedBottom])

	useEffect(() => {
		if (isOnFollowersTab) {
			getForFollowers(true)
		} else {
			get(true)
		}
	}, [isOnFollowersTab])

	function handleCreatePost() {
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
				setIsCreatePostOpen(false)
			})
	}

	return (
		<div className="flex justify-between gap-x-8 px-8 py-8">
			<div className="sticky w-[30%]">
				<Card
					className="mx-auto cursor-pointer"
					onClick={() => navigate("/me")}
				>
					<CardHeader className="flex flex-row items-center gap-4">
						<img
							src={`http://localhost:8080/files/${user!.avatarUrl}`}
							alt={`${user!.name}'s avatar`}
							className="h-10 w-10 rounded-full object-cover"
						/>
						<div>
							<h1 className="text-2xl font-bold">{user!.name}</h1>
						</div>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground">{user!.excerpt}</p>
					</CardContent>
					<CardFooter className="flex justify-center gap-8 border-t pt-4">
						<button className="flex flex-col items-center transition-colors hover:text-primary">
							<span className="text-xl font-bold">{followers.length}</span>
							<span className="text-sm text-muted-foreground">Followers</span>
						</button>
						<button className="flex flex-col items-center transition-colors hover:text-primary">
							<span className="text-xl font-bold">{followings.length}</span>
							<span className="text-sm text-muted-foreground">Following</span>
						</button>
					</CardFooter>
				</Card>
				<div className="mt-8 max-w-2xl rounded-lg border border-gray-200 bg-white p-2 shadow-md">
					<nav className="flex flex-col">
						<div
							className={cn(
								"flex cursor-pointer items-center gap-3 rounded-md px-4 py-3 transition-colors",
								"hover:bg-gray-100",
								isOnFollowersTab ? "" : "bg-blue-50 text-blue-600",
							)}
							onClick={() => setIsOnFollowersTab(false)}
						>
							<div className="flex-shrink-0">
								<Home className="h-5 w-5" />
							</div>
							<span className="text-sm font-medium">Home</span>
						</div>
						<div
							className={cn(
								"flex cursor-pointer items-center gap-3 rounded-md px-4 py-3 transition-colors",
								"hover:bg-gray-100",
								isOnFollowersTab ? "bg-blue-50 text-blue-600" : "",
							)}
							onClick={() => setIsOnFollowersTab(true)}
						>
							<div className="flex-shrink-0">
								<Users className="h-5 w-5" />
							</div>
							<span className="text-sm font-medium">Followers</span>
						</div>
					</nav>
				</div>
			</div>
			<div className="mx-auto flex-[1] space-y-6">
				<div className="text-center">
					<Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
						<DialogTrigger asChild>
							<Button size="lg" className="bg-blue-600 hover:bg-blue-700">
								What's up today?
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-md">
							<DialogHeader>
								<DialogTitle className="text-xl font-bold">
									Create New Post
								</DialogTitle>
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
										<Label
											htmlFor="private-toggle"
											className="text-sm font-medium"
										>
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
				{posts?.map((post) => <PostUI postId={post} key={post} />)}
			</div>
			<div className="h-fit w-[25%] max-w-2xl rounded-lg border border-gray-200 bg-white p-2 shadow-md">
				<div className="mb-8 font-medium">Recommended Friends</div>
				{(!recommendedFriends || !recommendedFriends.length) && (
					<div className="text-sm">
						Oops, we didn't find any people matching your profile
					</div>
				)}
				{recommendedFriends &&
					recommendedFriends.length > 0 &&
					recommendedFriends.map((fr) => (
						<div key={fr.id} className="flex w-full flex-row items-center gap-4 mb-2">
							<img
								src={`http://localhost:8080/files/${fr.avatarUrl}`}
								alt={`${fr.name}'s avatar`}
								className="h-8 w-8 rounded-full"
							/>
							<a href={`/users/${fr.id}`}>
								<h1 className="text-sm font-bold">{fr.name}</h1>
							</a>
							<button
								onClick={() => {
									followApi(fr.id).then(() => {
										toast.success(`You followed ${fr.name}`)
										setRecommendedFriends(
											recommendedFriends.filter((f) => f.id !== fr.id),
										)
									})
								}}
								className="flex items-center gap-x-2 rounded-xl bg-blue-50 p-2"
							>
								<Plus className="h-5 w-5" />
								Follow
							</button>
						</div>
					))}
			</div>
		</div>
	)
}
