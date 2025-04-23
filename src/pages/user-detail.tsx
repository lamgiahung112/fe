import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { useEffect, useState } from "react"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { useNavigate, useParams } from "react-router-dom"
import PostUI from "@/components/post"
import { User } from "@/types/user"
import userDetailsApi from "@/apis/user_details"
import postsByUserId from "@/apis/posts_by_user"
import { Post } from "@/types/post"
import { UserCheck, UserPlus } from "lucide-react"
import followApi from "@/apis/follow"
import unfollowApi from "@/apis/unfollow"
import useUser from "@/stores/user-store"

export default function UserDetailPage() {
	const { userId } = useParams()
	const { user: currentUser } = useUser()
	const [user, setUser] = useState<User | null>()
	const [followers, setFollowers] = useState<User[]>([])
	const [followersOpen, setFollowersOpen] = useState(false)
	const [followings, setFollowings] = useState<User[]>([])
	const [followingsOpen, setFollowingsOpen] = useState(false)
	const [posts, setPosts] = useState<Post[]>([])
	const navigate = useNavigate()

	function fetchStates() {
		userDetailsApi(userId!)
			.then((data) => {
				if (!data) {
					navigate("/")
				}
				setUser(data.user)
				setFollowers(data.followers)
				setFollowings(data.following)
			})
			.then(() => postsByUserId(userId!))
			.then(setPosts)
	}

	useEffect(() => {
		if (!userId) {
			navigate("/")
		}
		fetchStates()
	}, [userId])

	const isFollowing =
		followers && followers.filter((f) => f.id === currentUser?.id).length > 0

	if (!user) {
		return <div>Loading...</div>
	}

	return (
		<div className="container py-8">
			<Card className="mx-auto max-w-2xl">
				<CardHeader className="flex flex-row items-center gap-4">
					<img
						src={`http://localhost:8080/files/${user!.avatarUrl}`}
						alt={`${user!.name}'s avatar`}
						className="h-20 w-20 rounded-full"
					/>
					<div className="flex-grow">
						<h1 className="text-2xl font-bold">{user!.name}</h1>
					</div>
					<button
						onClick={() => {
							if (!isFollowing) {
								followApi(userId!).then(fetchStates)
								return
							}
							unfollowApi(userId!).then(fetchStates)
						}}
						className={`
							flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold 
							${
								isFollowing
									? "bg-primary text-primary-foreground"
									: "border border-primary text-primary hover:bg-primary/10"
							}
            		`}
					>
						{isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
						{isFollowing ? "Following" : "Follow"}
					</button>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">{user!.excerpt}</p>
				</CardContent>
				<CardFooter className="flex justify-center gap-8 border-t pt-4">
					<button
						onClick={() => setFollowersOpen(true)}
						className="flex flex-col items-center transition-colors hover:text-primary"
					>
						<span className="text-xl font-bold">{followers?.length ?? 0}</span>
						<span className="text-sm text-muted-foreground">Followers</span>
					</button>
					<button
						onClick={() => setFollowingsOpen(true)}
						className="flex flex-col items-center transition-colors hover:text-primary"
					>
						<span className="text-xl font-bold">{followings?.length ?? 0}</span>
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

			{/* Posts Section */}
			<div className="mx-auto mt-8 max-w-2xl space-y-6">
				{posts?.filter(p => !p.isPrivate || isFollowing).map((post) => <PostUI postId={post.id} key={post.id} />)}
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
					{!users || users.length === 0 ? (
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
										navigate(`/users/${user.username}`)
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
