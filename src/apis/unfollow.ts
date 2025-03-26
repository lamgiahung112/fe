import http from "./client"

export default function unfollowApi(targetUserId: string) {
	return http.post(`/users/${targetUserId}/unfollow`)
}
