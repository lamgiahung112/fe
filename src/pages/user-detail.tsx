import { useParams } from "react-router-dom"

export default function UserDetailPage() {
	const { userId } = useParams()
	return <div>{userId}</div>
}
