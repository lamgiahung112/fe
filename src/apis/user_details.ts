import { User } from "@/types/user.ts"
import http from "@/apis/client.ts"

export default function userDetailsApi(id: string): Promise<{user: User, followers: User[], following: User[]}> {
	return http.get(`/users/${id}`).then(res => res.data.data).catch(() => null)
}