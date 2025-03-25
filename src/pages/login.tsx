import { Link, useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Lock } from "lucide-react";
import useUser from "@/stores/user-store.ts"
import { useEffect, useState } from "react"

export default function LoginPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	const {
		login,
		isAuthenticated,
		getDetail
	} = useUser()

	function handleSubmit() {
		login(username, password).then(getDetail)
	}

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/")
		}
	}, [isAuthenticated])

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
			<div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-md">
				<h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Login</h2>

				<div className="mb-4">
					<label className="block text-gray-700 font-medium mb-1">Username</label>
					<div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
						<User className="w-5 h-5 text-gray-500" />
						<Input type="text" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} className="flex-1 bg-transparent border-none outline-none focus:ring-0 focus-visible:ring-0" />
					</div>
				</div>

				<div className="mb-4">
					<label className="block text-gray-700 font-medium mb-1">Password</label>
					<div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
						<Lock className="w-5 h-5 text-gray-500" />
						<Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="flex-1 bg-transparent border-none outline-none focus:ring-0 focus-visible:ring-0" />
					</div>
				</div>

				<Button className="w-full mt-4" onClick={handleSubmit}>Login</Button>

				<p className="mt-4 text-sm text-center text-gray-600">
					Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Click here to sign up!</Link>
				</p>
			</div>
		</div>
	);
}
