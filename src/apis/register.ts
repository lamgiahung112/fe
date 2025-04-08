import http from './client.ts'
import { toast } from "react-toastify"

function registerApi(username: string, password: string, name: string, excerpt: string, avatar: File, email: string): Promise<boolean> {
	const data = new FormData()
	data.append('username', username)
	data.append('password', password)
	data.append('name', name)
	data.append('email', email)
	data.append('excerpt', excerpt)
	data.append('file', avatar)

	return http.post("/register", data).then(() => {
		toast.success("Register successful")
		return true
	}).catch(() => {
		toast.error("Register failed! Please try again later")
		return false
	})
}

export default registerApi