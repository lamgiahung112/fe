import http from "@/apis/client.ts"

export default function createCommentApi(postId: string, text: string, file: File | null): Promise<void> {
	const data = new FormData();
	if (file) {
		data.append("file", file);
	}
	data.append("text", text);
	return http.post(`/post/${postId}/comment`, data);
}