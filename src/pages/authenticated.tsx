import useUser from "@/stores/user-store.ts"
import { PropsWithChildren, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import useNewsfeed from "@/stores/newsfeed-store.ts"

function Authenticated({children}: PropsWithChildren) {
	const {
		fetchUsers
	} = useNewsfeed()
	const {isAuthenticated} = useUser()
	const navigate = useNavigate()

	useEffect(() => {
		if (!isAuthenticated) {
			navigate('/login')
			return
		}
		fetchUsers()
	}, [isAuthenticated])
	return (
			children
		)
}

export default Authenticated