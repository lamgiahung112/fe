import { useSearchParams } from "react-router-dom"
import PostUI from "@/components/post.tsx"

export default function PostPage() {
	const [keys] = useSearchParams()

	return (
		<div className="container py-8">
			<PostUI postId={keys.get("post")!} />
		</div>
	)
}
