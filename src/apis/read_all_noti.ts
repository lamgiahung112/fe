import http from "@/apis/client.ts"

export default function readAllNotiApi() {
	return http.post(`/noti/read`);
}