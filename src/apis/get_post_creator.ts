import { User } from "@/types/user"
import http from "./client"

export default function getPostCreatorApi(postId: string): Promise<User> {
	return http
		.get(`/post/${postId}/creator`)
		.then((res) => res.data.data)
		.catch(() => null)
}
