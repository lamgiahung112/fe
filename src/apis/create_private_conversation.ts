import http from "@/apis/client.ts"

export default function createPrivateConversationApi(targetUserId: string): Promise<void> {
	const data = new FormData();
	data.append("target_user_id", targetUserId);
	return http.post("/conversation/private", data)
}