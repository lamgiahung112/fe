import { useEffect, useState } from "react"
import { User, Lock, Image } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom"
import useUser from "@/stores/user-store.ts"

export default function RegisterPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [excerpt, setExcerpt] = useState("");
	const [avatar, setAvatar] = useState<File | null>(null);
	const {register, isAuthenticated} = useUser()
	const navigate = useNavigate();

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setAvatar(e.target.files[0]);
		}
	};

	const handleSubmit = () => {
		if (!avatar) {
			return
		}
		register(username, password, name, excerpt, avatar).then((ok) => {
			if (ok) {
				navigate("/login");
			}
		});
	};

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/");
		}
	}, [isAuthenticated])

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
			<div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-md">
				<h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Register</h2>

				<div className="mb-4">
					<label className="block text-gray-700 font-medium mb-1">Username</label>
					<div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
						<User className="w-5 h-5 text-gray-500" />
						<Input
							type="text"
							placeholder="Enter your username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="flex-1 bg-transparent border-none outline-none focus:ring-0 focus-visible:ring-0"
						/>
					</div>
				</div>

				<div className="mb-4">
					<label className="block text-gray-700 font-medium mb-1">Name</label>
					<Input
						type="text"
						placeholder="Enter your name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-0 focus-visible:ring-0"
					/>
				</div>

				<div className="mb-4">
					<label className="block text-gray-700 font-medium mb-1">Password</label>
					<div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
						<Lock className="w-5 h-5 text-gray-500" />
						<Input
							type="password"
							placeholder="Enter your password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="flex-1 bg-transparent border-none outline-none focus:ring-0 focus-visible:ring-0"
						/>
					</div>
				</div>

				<div className="mb-4">
					<label className="block text-gray-700 font-medium mb-1">Excerpt</label>
					<textarea
						placeholder="A short bio about yourself"
						value={excerpt}
						onChange={(e) => setExcerpt(e.target.value)}
						className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-0 focus-visible:ring-0"
					/>
				</div>

				<div className="mb-4">
					<label className="block text-gray-700 font-medium mb-1">Avatar</label>
					<div className="relative flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
						<Image className="w-5 h-5 text-gray-500 mr-2" />

						<label htmlFor="avatar-upload" className="flex-1 cursor-pointer text-gray-600">
							{avatar ? avatar.name : "Upload your avatar"}
						</label>

						<input
							id="avatar-upload"
							type="file"
							accept="image/*"
							onChange={handleAvatarChange}
							className="absolute inset-0 opacity-0 cursor-pointer"
						/>
					</div>
				</div>

				<Button className="w-full mt-4" onClick={handleSubmit}>Register</Button>

				<p className="mt-4 text-sm text-center text-gray-600">
					Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login here</Link>
				</p>
			</div>
		</div>
	);
}
