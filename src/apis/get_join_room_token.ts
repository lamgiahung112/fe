import http from "./client"

export default function getJoinRoomTokenApi(convId: string): Promise<string> {
	return http
		.get(`/joinRoomToken?convId=${convId}`)
		.then((res) => res.data.data)
}
