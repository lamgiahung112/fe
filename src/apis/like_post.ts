import http from "./client"

export default function likePostApi(postId: string) {
	return http.post(`/post/${postId}/like`)
}
