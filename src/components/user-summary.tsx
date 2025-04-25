import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { UserCheck, UserPlus } from "lucide-react"

import { Card } from "./ui/card"
import { Button } from "./ui/button"

import useUser from "@/stores/user-store"
import { User } from "@/types/user"
import userDetailsApi from "@/apis/user_details"
import followApi from "@/apis/follow"
import unfollowApi from "@/apis/unfollow"

export default function UserSummary({ userId }: { userId: string }) {
  const { user: currentUser } = useUser()
  const [user, setUser] = useState<User | null>(null)
  const [followers, setFollowers] = useState<User[]>([])
  const [followings, setFollowings] = useState<User[]>([])

  const fetchStates = () => {
    userDetailsApi(userId).then((data) => {
      if (!data) return
      setUser(data.user)
      setFollowers(data.followers)
      setFollowings(data.following)
    })
  }

  useEffect(() => {
    if (userId) {
      fetchStates()
    }
  }, [userId])

  const isFollowing = followers.some((f) => f.id === currentUser?.id)

  if (!user) return null

  return (
    <Card className="w-full max-w-md mx-auto shadow-md overflow-hidden">
  {/* Dòng đầu: Avatar + Tên + Nút */}
  <div className="flex items-center gap-4 px-6 py-4 border-b dark:border-gray-700">
    {/* Avatar */}
    <img
      src={`http://localhost:8080/files/${user.avatarUrl}`}
      alt={`${user.name}'s avatar`}
      className="h-14 w-14 rounded-full object-cover border border-gray-300 dark:border-gray-600"
    />

    {/* Tên + Giới thiệu */}
    <div className="flex flex-col">
      <Link
        to={`/users/${user.id}`}
        className="text-lg font-semibold hover:underline text-foreground"
      >
        {user.name}
      </Link>
      {user.excerpt && (
        <p className="text-sm text-muted-foreground">{user.excerpt}</p>
      )}
    </div>

    {/* Nút Follow */}
    <div className="ml-auto">
        <Button
          variant={isFollowing ? "default" : "outline"}
          size="sm"
          className="rounded-full flex items-center gap-2"
          onClick={() => {
            isFollowing
              ? unfollowApi(userId).then(fetchStates)
              : followApi(userId).then(fetchStates)
          }}
        >
          {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
          {isFollowing ? "Following" : "Follow"}
        </Button>
      </div>
    </div>

      {/* Dòng dưới: Followers / Following */}
      <div className="grid grid-cols-2 text-center px-6 py-3">
        <div className="border-r dark:border-gray-700">
          <span className="block text-lg font-semibold">{followers.length}</span>
          <span className="text-sm text-muted-foreground">Followers</span>
        </div>
        <div>
          <span className="block text-lg font-semibold">{followings.length}</span>
          <span className="text-sm text-muted-foreground">Following</span>
        </div>
      </div>
    </Card>

  )
}
