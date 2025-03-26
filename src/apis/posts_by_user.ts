import { Post } from "@/types/post"
import http from "./client"

export default function postsByUserId(id: string): Promise<Post[]> {
	return http
		.get(`/post/user/${id}`)
		.then((res) => res.data.data)
		.catch(() => [])
}
