import {create} from 'zustand'
import { User } from "@/types/user.ts"
import loginApi from "@/apis/login.ts"
import registerApi from "@/apis/register.ts"
import whoamiApi from "@/apis/whoami.ts"

const useUser = create<UserStoreState & UserStoreAction>((set) => {
	return {
		user: JSON.parse(localStorage.getItem("user") ?? "null"),
		isAuthenticated: !!JSON.parse(localStorage.getItem("user") ?? "null"),
		logout(): void {
			localStorage.removeItem("user");
			set(() => ({
				user: null,
				isAuthenticated: false,
			}));
		},
		async getDetail(): Promise<void> {
			const data = await whoamiApi()
			if (!data) return
			localStorage.setItem("user", JSON.stringify(data))
			set(() => ({
				user: data,
				isAuthenticated: true,
			}));
		},
		login(username: string, password: string): Promise<boolean> {
			return loginApi(username, password)
		},
		register(username: string, password: string, name: string, excerpt: string, avatar: File, email: string): Promise<boolean> {
			return registerApi(username, password, name, excerpt, avatar, email)
		},
	}
})

type UserStoreState = {
	user: User | null
	isAuthenticated: boolean
}

type UserStoreAction = {
	login(username: string, password: string): Promise<boolean>
	register(username: string, password: string, name: string, excerpt: string, avatar: File, email: string): Promise<boolean>
	getDetail(): Promise<void>
	logout: () => void
}

export default useUser