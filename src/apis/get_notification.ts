import http from "@/apis/client.ts"
import { Notification } from "@/types/notification.ts"

export default function getNotificationApi(skip: number): Promise<Notification[]> {
	return http.get(`/noti?skip=${skip}`).then(res => res.data.data);
}