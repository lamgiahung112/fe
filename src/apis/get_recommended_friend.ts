import { User } from "@/types/user.ts"
import http from "@/apis/client.ts"

export default function getRecommendedFriends(): Promise<User[]> {
	return http.get("/recommendedFriend").then(res => res.data.data).catch(() => [])
}