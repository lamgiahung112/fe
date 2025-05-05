import { useLocation } from "react-router-dom"
import { SiteHeader } from "@/components/site-header"
import { useRoutes } from "react-router-dom"
import { TailwindIndicator } from "./components/tailwind-indicator"
import LoginPage from "@/pages/login.tsx"
import RegisterPage from "@/pages/register.tsx"
import { ToastContainer } from "react-toastify"
import MePage from "./pages/me"
import Authenticated from "./pages/authenticated"
import UserDetailPage from "./pages/user-detail"
import HomePage from "./pages/home"
import SearchPage from "./pages/search"
import ForgetPasswordPage from "@/pages/forget_password.tsx"
import MessengerPage from "@/pages/messenger.tsx"
import PostPage from "@/pages/post.tsx"
import { useEffect } from "react"
import whoamiApi from "@/apis/whoami.ts"
import VideoCallPage from "./pages/video-call"

const routes = [
	{ path: "/login", element: <LoginPage /> },
	{ path: "/register", element: <RegisterPage /> },
	{
		path: "/me",
		element: (
			<Authenticated>
				<MePage />
			</Authenticated>
		),
	},
	{
		path: "/users/:userId",
		element: (
			<Authenticated>
				<UserDetailPage />
			</Authenticated>
		),
	},
	{
		path: "/",
		element: (
			<Authenticated>
				<HomePage />
			</Authenticated>
		),
	},
	{
		path: "/search",
		element: (
			<Authenticated>
				<SearchPage />
			</Authenticated>
		),
	},
	{
		path: "/forget_password",
		element: <ForgetPasswordPage />,
	},
	{
		path: "/messenger",
		element: (
			<Authenticated>
				<MessengerPage />
			</Authenticated>
		),
	},
	{
		path: "/post",
		element: <PostPage />,
	},
	{
		path: "/videocall/:convId",
		element: (
			<Authenticated>
				<VideoCallPage />
			</Authenticated>
		),
	},
]

function App() {
	const children = useRoutes(routes)
	const location = useLocation()

	useEffect(() => {
		whoamiApi()
	}, [])

	// Những route không cần hiển thị Header
	const hideHeaderRoutes = ["/login", "/register", "/forget_password"]
	const shouldShowHeader = !hideHeaderRoutes.includes(location.pathname)

	return (
		<>
			<ToastContainer position="top-center" />
			<div className="relative flex min-h-screen flex-col">
				{shouldShowHeader && <SiteHeader />}
				{children}
			</div>
			<TailwindIndicator />
		</>
	)
}

export default App
