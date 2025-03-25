import http from "./client"

export default function unlikePostApi(postId: string) {
	return http.post(`/post/${postId}/unlike`)
}
