import http from "./client"

export default function createPostApi(
	caption: string,
	attachment: File | null,
): Promise<void> {
	const data = new FormData()
	if (attachment) {
		data.append("file", attachment)
	}
	data.append("caption", caption)
	return http.post("/post", data)
}
