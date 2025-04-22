import http from "@/apis/client.ts"

export default function updateProfileApi(name: string, excerpt: string, attachmentUrl: string, file: File | null) {
	const data = new FormData();
	data.append("name", name);
	data.append("excerpt", excerpt);
	data.append("attachmentUrl", attachmentUrl);
	if (file) {
		data.append("avatar", file);
	}
	return http.post("/updateProfile", data)
}