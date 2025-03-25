import { Post } from "@/types/post"
import http from "./client"

export default function postByIdApi(postId: string): Promise<Post> {
	return http
		.get(`/post/${postId}`)
		.then((res) => res.data.data)
		.catch(() => null)
}
