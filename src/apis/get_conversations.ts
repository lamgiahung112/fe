import { Conversation } from "@/types/conversation.ts"
import http from "@/apis/client.ts"

export default function getConversationsApi(): Promise<Conversation[]> {
	return http.get("conversations").then(res => res.data.data).catch(() => [])
}