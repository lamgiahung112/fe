import http from "@/apis/client.ts"

export default function changeConversationNameApi(convId: string, convName: string) {
	return http.post(`/conversation/name?conv_id=${convId}&conv_name=${convName}`)
}