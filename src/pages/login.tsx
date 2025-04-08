import { Link, useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { User, Lock } from "lucide-react"
import useUser from "@/stores/user-store.ts"
import { useEffect, useState } from "react"

export default function LoginPage() {
	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")
	const navigate = useNavigate()

	const { login, isAuthenticated, getDetail } = useUser()

	function handleSubmit() {
		login(username, password).then(getDetail)
	}

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/")
		}
	}, [isAuthenticated])

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6">
			<div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-md">
				<h2 className="mb-4 text-center text-2xl font-semibold text-gray-800">
					Login
				</h2>

				<div className="mb-4">
					<label className="mb-1 block font-medium text-gray-700">
						Username
					</label>
					<div className="flex items-center rounded-lg border bg-gray-50 px-3 py-2">
						<User className="h-5 w-5 text-gray-500" />
						<Input
							type="text"
							placeholder="Enter your username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="flex-1 border-none bg-transparent outline-none focus:ring-0 focus-visible:ring-0"
						/>
					</div>
				</div>

				<div className="mb-4">
					<label className="mb-1 block font-medium text-gray-700">
						Password
					</label>
					<div className="flex items-center rounded-lg border bg-gray-50 px-3 py-2">
						<Lock className="h-5 w-5 text-gray-500" />
						<Input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter your password"
							className="flex-1 border-none bg-transparent outline-none focus:ring-0 focus-visible:ring-0"
						/>
					</div>
				</div>

				<Button className="mt-4 w-full" onClick={handleSubmit}>
					Login
				</Button>

				<p className="mt-4 text-center text-sm text-gray-600">
					Don't have an account?{" "}
					<Link to="/register" className="text-blue-600 hover:underline">
						Click here to sign up!
					</Link>
				</p>
				<p className="mt-4 text-sm text-center text-gray-600">
					Forgot your password? <Link to="/forget_password" className="text-blue-600 hover:underline">Click here</Link>
				</p>
			</div>
		</div>
	)
}
