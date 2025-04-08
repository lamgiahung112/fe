import http from "@/apis/client.ts"

export default function createMessage(conversationId: string, attachment: File | null, text: string): Promise<void> {
	const data = new FormData()
	data.append("text", text)
	if (attachment != null) {
		data.append("attachment", attachment)
	}
	return http.post("/message?conv_id="+conversationId, data)
}