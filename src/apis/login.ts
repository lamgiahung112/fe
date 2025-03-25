import http from './client.ts'
import { toast } from "react-toastify"

function loginApi(username: string, password: string): Promise<boolean> {
	const data = new FormData()
	data.append('username', username)
	data.append('password', password)
	return http.post("/login", data).then(() => {
		toast("Login successful!")
		return true
	}).catch(() => {
		toast("Username or password is incorrect")
		return false
	})
}

export default loginApi