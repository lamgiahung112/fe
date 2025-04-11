import http from "@/apis/client.ts"

export default function addUserToConversationApi(convId: string, userIds: string[]) {
	return http.post(`/conversation/users?conv_id=${convId}&user_id=${userIds.join(",")}`)
}