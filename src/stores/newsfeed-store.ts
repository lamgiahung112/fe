import {create} from 'zustand'
import { User } from "@/types/user.ts"
import { Post } from "@/types/post.ts"
import userDetailsApi from "@/apis/user_details.ts"
import useUser from "@/stores/user-store.ts"
import getNewsfeedApi from "@/apis/get_newsfeed.ts"

const useNewsfeed = create<UseNewsfeedState & UseNewsfeedAction>((set, getState) => {
	return {
		posts: [],
		users: [],
		reset(): Promise<void> {
			set(() => {
				return {
					posts: [],
				}
			})
			return this.get()
		},
		get(): Promise<void> {
			getNewsfeedApi(getState().posts.length).then((res) => {
				if (res) {
					set(() => {
						return {
							posts: res,
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
						users: data.followers.concat(data.following).concat(data.user)
					}
				})
			})
			return Promise.resolve()
		},
	}
})

type UseNewsfeedState = {
	users: User[]
	posts: Post[]
}

type UseNewsfeedAction = {
	get(): Promise<void>
	reset(): Promise<void>
	fetchUsers(): Promise<void>
}

export default useNewsfeed