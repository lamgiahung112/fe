import searchByKeywordApi from "@/apis/search"
import PostUI from "@/components/post"
import UserSummary from "@/components/user-summary"
import { memo, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"

function SearchPage() {
	const [params] = useSearchParams()
	const keyword = useMemo(() => params.get("keyword"), [params])
	const [userByUsername, setUserByUsername] = useState("")
	const [usersByName, setUsersByName] = useState<string[]>([])
	const [postsByCaption, setPostsByCaption] = useState<string[]>([])
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		if (!keyword) {
			return
		}
		setIsLoading(true)
		searchByKeywordApi(keyword)
			.then((data) => {
				setUserByUsername(data.user)
				setUsersByName(data.users)
				setPostsByCaption(data.posts)
			})
			.finally(() => setIsLoading(false))
	}, [keyword])

	if (isLoading) {
		return (
			<div>Searching...</div>
		)
	}

	return (
		<div className="container mx-auto p-4 bg-white dark:bg-gray-900 min-h-screen">
			<div className="text-lg font-medium text-gray-800 dark:text-gray-100">
				Search result for keyword: {keyword}
			</div>
			<div className="mt-4 grid grid-cols-2 gap-4">
				<div className="rounded bg-gray-100 dark:bg-gray-800 p-4 text-center text-gray-800 dark:text-gray-100">
					<h3>Users Matched</h3>
					<p>{usersByName?.length + (userByUsername ? 1 : 0)}</p>
				</div>
				<div className="rounded bg-gray-100 dark:bg-gray-800 p-4 text-center text-gray-800 dark:text-gray-100">
					<h3>Posts Matched</h3>
					<p>{postsByCaption?.length ?? 0}</p>
				</div>
			</div>
			<div className="mt-4 border-t pt-4">
				<div className="flex min-h-[200px] flex-col gap-y-4 rounded px-[10%]">
					{userByUsername && <UserSummary userId={userByUsername} />}
					{usersByName?.map((userId) => <UserSummary key={userId} userId={userId} />)}
                    {postsByCaption?.map(postId => <PostUI postId={postId} key={postId} />)}
				</div>
			</div>
		</div>
	)
}

export default memo(SearchPage)
