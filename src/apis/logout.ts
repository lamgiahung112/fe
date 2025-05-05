import http from './client.ts'

function logoutApi()  {
	return http.post("/logout")
	}

export default logoutApi