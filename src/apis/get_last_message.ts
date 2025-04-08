import { Message } from "@/types/message.ts"
import http from "@/apis/client.ts"

export default function getLastMessageApi(convId: string): Promise<Message> {
	return http.get("/message/last?conv_id="+convId).then(res => res.data.data)
}