import { User } from "@/types/user.ts"
import http from "@/apis/client.ts"

export default function usersInConversationApi(convId: string): Promise<User[]> {
	return http.get(`/conversation/users?convId=${convId}`).then(res => res.data.data)
}