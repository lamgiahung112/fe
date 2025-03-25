import http from "@/apis/client.ts"
import { User } from "@/types/user.ts"

function whoamiApi() {
	return http.get("/whoami").then((res) => {
		return res.data.data as User
	}).catch((err) => {
		console.log(err)
		return null
	})
}

export default whoamiApi