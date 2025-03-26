import PostUI from "@/components/post"
import useNewsfeed from "@/stores/newsfeed-store"
import { useEffect, useState } from "react"

export default function HomePage() {
	const { posts, reset, get } = useNewsfeed()
	const [hasReachedBottom, setHasReachedBottom] = useState(false)

	useEffect(() => {
		reset()
		const handleScroll = () => {
			const scrolledToBottom =
				window.innerHeight + window.scrollY >=
				document.documentElement.scrollHeight - 10
			setHasReachedBottom(scrolledToBottom)
		}
		window.addEventListener("scroll", handleScroll)
		return () => window.removeEventListener("scroll", handleScroll)
	}, [])

	useEffect(() => {
		if (hasReachedBottom) {
			get()
		}
	}, [hasReachedBottom])

	return (
		<div className="container py-8">
			<div className="mx-auto mt-8 max-w-2xl space-y-6">
				{posts?.map((post) => <PostUI postId={post} key={post} />)}
			</div>
		</div>
	)
}
