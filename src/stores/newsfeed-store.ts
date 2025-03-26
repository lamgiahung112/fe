import { create } from "zustand"
import { User } from "@/types/user.ts"
import userDetailsApi from "@/apis/user_details.ts"
import useUser from "@/stores/user-store.ts"
import getNewsfeedApi from "@/apis/get_newsfeed.ts"

const useNewsfeed = create<UseNewsfeedState & UseNewsfeedAction>(
	(set, getState) => {
		return {
			posts: [],
			users: [],
			followers: [],
			followings: [],
			reset(): Promise<void> {
				set(() => {
					return {
						posts: [],
					}
				})
				return getState().get()
			},
			get(): Promise<void> {
				getNewsfeedApi(getState().posts.length).then((res) => {
					if (res) {
						res = res.filter(pid => getState().posts.includes(pid) == false)
						set(() => {
							return {
								posts: getState().posts.concat(...res),
							}
						})
					}
				})
				return Promise.resolve()
			},
			fetchUsers(): Promise<void> {
				if (!useUser.getState().user?.id) {
					return Promise.resolve()
				}
				userDetailsApi(useUser.getState().user!.id).then((data) => {
					set(() => {
						return {
							followers: data.followers ?? [],
							followings: data.following ?? [],
							users: (data.followers ?? [])
								.concat(data.following ?? [])
								.concat(data.user),
						}
					})
				})
				return Promise.resolve()
			},
		}
	},
)

type UseNewsfeedState = {
	users: User[]
	followers: User[]
	followings: User[]
	posts: string[]
}

type UseNewsfeedAction = {
	get(): Promise<void>
	reset(): Promise<void>
	fetchUsers(): Promise<void>
}

export default useNewsfeed
