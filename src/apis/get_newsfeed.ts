import http from "@/apis/client.ts"
import { Post } from "@/types/post.ts"

export default function getNewsfeedApi(skip: number): Promise<Post[]> {
	return http.get("/newsfeed?skip=" + skip).then(res => res.data.data).catch(() => null)
}