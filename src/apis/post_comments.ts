import { Comment } from "@/types/comment.ts"
import http from "@/apis/client.ts"

export default function getPostCommentsApi(postId: string): Promise<Comment[]> {
	return http.get(`/post/${postId}/comments`).then(res => res.data.data).catch(() => [])
}