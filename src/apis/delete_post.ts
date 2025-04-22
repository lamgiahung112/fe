import http from "@/apis/client.ts"

export default function deletePostApi(postId: string) {
	return http.delete(`/deletePost?postId=${postId}`)
}