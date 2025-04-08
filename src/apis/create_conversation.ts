import http from "@/apis/client.ts"

export default function createConversationApi(name: string, users: string[]): Promise<void> {
	const data = new FormData();
	data.append("conversation_name", name);
	data.append("target_ids", users.join(","))
	return http.post("/conversation", data)
}