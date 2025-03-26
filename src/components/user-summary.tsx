import followApi from "@/apis/follow"
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card"
import unfollowApi from "@/apis/unfollow"
import { UserCheck, UserPlus } from "lucide-react"
import { useEffect, useState } from "react"
import { User } from "@/types/user"
import useUser from "@/stores/user-store"
import userDetailsApi from "@/apis/user_details"
import { Link } from "react-router-dom"

export default function UserSummary({ userId }: { userId: string }) {
	const { user: currentUser } = useUser()
	const [user, setUser] = useState<User | null>()
	const [followers, setFollowers] = useState<User[]>([])
	const [followings, setFollowings] = useState<User[]>([])

	function fetchStates() {
		userDetailsApi(userId!).then((data) => {
			if (!data) {
				return
			}
			setUser(data.user)
			setFollowers(data.followers)
			setFollowings(data.following)
		})
	}

	useEffect(() => {
		if (!userId) {
			return
		}
		fetchStates()
	}, [userId])

	const isFollowing =
		followers && followers.filter((f) => f.id === currentUser?.id).length > 0

	if (!user) {
		return <></>
	}

	return (
		<Card className="mx-auto w-full">
			<CardHeader className="flex flex-row items-center gap-4">
				<img
					src={`http://localhost:8080/files/${user!.avatarUrl}`}
					alt={`${user!.name}'s avatar`}
					className="h-20 w-20 rounded-full"
				/>
				<Link to={`/users/${user.id}`} className="flex-grow">
					<h1 className="text-2xl font-bold">{user!.name}</h1>
				</Link>
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
				<div className="flex flex-col items-center transition-colors hover:text-primary">
					<span className="text-xl font-bold">{followers?.length ?? 0}</span>
					<span className="text-sm text-muted-foreground">Followers</span>
				</div>
				<div className="flex flex-col items-center transition-colors hover:text-primary">
					<span className="text-xl font-bold">{followings?.length ?? 0}</span>
					<span className="text-sm text-muted-foreground">Following</span>
				</div>
			</CardFooter>
		</Card>
	)
}
