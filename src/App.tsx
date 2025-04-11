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
import ForgetPasswordPage from "@/pages/forget_password.tsx";
import MessengerPage from "@/pages/messenger.tsx"
import PostPage from "@/pages/post.tsx"

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
		element: (
			<ForgetPasswordPage />
		),
	},
	{
		path: "/messenger",
		element: (
			<Authenticated>
				<MessengerPage />
			</Authenticated>
		)
	},
	{
		path: "/post",
		element: (
			<PostPage />
		)
	}
]

function App() {
	const children = useRoutes(routes)

	return (
		<>
			<ToastContainer position="top-center" />
			<div className="relative flex min-h-screen flex-col">
				<SiteHeader />
				{children}
			</div>
			<TailwindIndicator />
		</>
	)
}

export default App
