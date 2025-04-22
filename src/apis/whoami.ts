import http from "@/apis/client.ts"
import { User } from "@/types/user.ts"

function whoamiApi() {
	const userId = JSON.parse(localStorage.getItem("user") ?? "{}")?.id
	return http.get(`/whoami?userId=${userId}`).then((res) => {
		return res.data.data as User
	}).catch((err) => {
		console.log(err)
		return null
	})
}

export default whoamiApi