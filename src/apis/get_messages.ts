import { Message } from "@/types/message.ts"
import http from "@/apis/client.ts"

export default function getMessagesApi(skip: number, convId: string): Promise<Message[]> {
	return http.get(`/messages?skip=${skip}&conv_id=${convId}`).then(res => res.data.data)
}