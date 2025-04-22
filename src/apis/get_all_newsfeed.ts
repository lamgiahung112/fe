import http from "@/apis/client.ts"

export default function getAllNewsfeedApi(skip: number): Promise<string[]> {
	return http
		.get("/allNewsfeed?skip=" + skip)
		.then((res) => res.data.data)
		.catch(() => [])
}
