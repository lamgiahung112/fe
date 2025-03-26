import http from "@/apis/client.ts"

export default function getNewsfeedApi(skip: number): Promise<string[]> {
	return http
		.get("/newsfeed?skip=" + skip)
		.then((res) => res.data.data)
		.catch(() => [])
}
