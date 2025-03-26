import http from "./client"

export default function followApi(targetUserId: string) {
	return http.post(`/users/${targetUserId}/follow`)
}
