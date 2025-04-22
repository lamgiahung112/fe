import http from "@/apis/client.ts"

export default function updatePostApi(postId: string, caption: string, attachmentUrl: string, file: File | null, isPrivate: boolean) {
	const data = new FormData()
	data.append('caption', caption)
	data.append('attachmentUrl', attachmentUrl)
	data.append('isPrivate', isPrivate ? "true" : "false")
	if (file) {
		data.append('file', file)
	}
	return http.post(`/updatePost?postId=${postId}`, data)
}