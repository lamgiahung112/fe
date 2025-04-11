import http from "@/apis/client.ts"

export default function userLeaveConversationApi(convId: string) {
	return http.post(`/conversation/users/leave?conv_id=${convId}`)
}