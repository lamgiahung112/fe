import { SiteHeader } from "@/components/site-header"
import { useRoutes } from "react-router-dom"
import { TailwindIndicator } from "./components/tailwind-indicator"
import LoginPage from "@/pages/login.tsx"
import RegisterPage from "@/pages/register.tsx"
import { ToastContainer } from "react-toastify"
import useUser from "@/stores/user-store.ts"
import useNewsfeed from "@/stores/newsfeed-store.ts"
import { useEffect } from "react"
import MePage from "./pages/me"
import Authenticated from "./pages/authenticated"
import UserDetailPage from "./pages/user-detail"

const routes = [
	{ path: "/", element: <Home /> },
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
]

function Home() {
	const { user } = useUser()
	const { posts, get } = useNewsfeed()

	useEffect(() => {
		get()
	}, [])

	return (
		<section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
			<div className="flex max-w-[980px] flex-col items-start gap-2">
				<h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
					{posts.length} Beautifully designed components{" "}
					<br className="hidden sm:inline" />
					built with Radix UI and Tailwind CSS. {user?.username}
				</h1>
				<p className="max-w-[700px] text-lg text-muted-foreground">
					Accessible and customizable components that you can copy and paste
					into your apps. Free. Open Source. And Vite Ready.
				</p>
			</div>
		</section>
	)
}

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
