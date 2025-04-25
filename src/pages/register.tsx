"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { User, Lock, Mail, ArrowLeft, Upload, CheckCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router-dom"
import useUser from "@/stores/user-store.ts"
import { toast } from "react-toastify"

export default function RegisterPage() {
	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")
	const [name, setName] = useState("")
	const [email, setEmail] = useState("")
	const [excerpt, setExcerpt] = useState("")
	const [avatar, setAvatar] = useState<File | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
	const { register, isAuthenticated } = useUser()
	const navigate = useNavigate()

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const file = e.target.files[0]
			setAvatar(file)

			// Create preview URL
			const reader = new FileReader()
			reader.onloadend = () => {
				setAvatarPreview(reader.result as string)
			}
			reader.readAsDataURL(file)
		}
	}

	const validateForm = () => {
		if (!username.trim()) {
			toast.error("Username is required")
			return false
		}
		if (!name.trim()) {
			toast.error("Name is required")
			return false
		}
		if (!email.trim()) {
			toast.error("Email is required")
			return false
		}
		if (!password.trim()) {
			toast.error("Password is required")
			return false
		}
		if (!avatar) {
			toast.error("Avatar is required")
			return false
		}
		if (username === "triko") {
			toast.error("Username already exists!")
			return false
		}
		if (password.includes("!")) {
			toast.error("Password is too weak!")
			return false
		}
		return true
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		if (!validateForm()) {
			return
		}

		setIsLoading(true)
		register(username, password, name, excerpt, avatar!, email)
			.then((ok) => {
				if (ok) {
					toast.success("Registration successful! Please log in.")
					navigate("/login")
				}
			})
			.catch((error) => {
				console.error("Registration error:", error)
				toast.error("Registration failed. Please try again.")
			})
			.finally(() => {
				setIsLoading(false)
			})
	}

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/")
		}
	}, [isAuthenticated, navigate])

	return (
		<div className="flex min-h-screen flex-col md:flex-row">
			{/* Left side - Branding/Image */}
			<div className="flex flex-col items-center justify-center bg-blue-600 py-12 md:w-1/2">
				<div className="px-8 text-center">
					<div className="mb-6 flex items-center justify-center">
						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-blue-600 shadow-lg">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="h-10 w-10"
							>
								<path d="M8.75 13.5C8.75 14.88 7.63 16 6.25 16C4.87 16 3.75 14.88 3.75 13.5C3.75 12.12 4.87 11 6.25 11C7.63 11 8.75 12.12 8.75 13.5Z" />
								<path d="M15.75 13.5C15.75 14.88 16.87 16 18.25 16C19.63 16 20.75 14.88 20.75 13.5C20.75 12.12 19.63 11 18.25 11C16.87 11 15.75 12.12 15.75 13.5Z" />
								<path d="M12 11.5C13.1 11.5 14 10.6 14 9.5C14 8.4 13.1 7.5 12 7.5C10.9 7.5 10 8.4 10 9.5C10 10.6 10.9 11.5 12 11.5Z" />
								<path d="M7.5 18C7.5 16.34 9.34 15 11 15H13C14.66 15 16.5 16.34 16.5 18V20H7.5V18Z" />
							</svg>
						</div>
					</div>
					<h1 className="mb-2 text-4xl font-bold text-white">Nexu</h1>
					<p className="text-xl text-blue-100">Join our community today</p>

					<div className="mt-12 space-y-6">
						<div className="flex items-center space-x-3 text-left text-white">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
								<CheckCircle className="h-6 w-6" />
							</div>
							<div>
								<h3 className="font-semibold">Create your profile</h3>
								<p className="text-sm text-blue-100">
									Showcase your interests and personality
								</p>
							</div>
						</div>

						<div className="flex items-center space-x-3 text-left text-white">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
								<CheckCircle className="h-6 w-6" />
							</div>
							<div>
								<h3 className="font-semibold">Connect with friends</h3>
								<p className="text-sm text-blue-100">
									Find and follow people you know
								</p>
							</div>
						</div>

						<div className="flex items-center space-x-3 text-left text-white">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
								<CheckCircle className="h-6 w-6" />
							</div>
							<div>
								<h3 className="font-semibold">Join the conversation</h3>
								<p className="text-sm text-blue-100">
									Share your thoughts and experiences
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Right side - Registration Form */}
			<div className="flex flex-1 items-center justify-center bg-gray-50 px-6 py-8 md:px-12">
				<div className="w-full max-w-md">
					<div className="mb-6 text-center md:hidden">
						<div className="mb-4 flex justify-center">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="h-10 w-10"
								>
									<path d="M8.75 13.5C8.75 14.88 7.63 16 6.25 16C4.87 16 3.75 14.88 3.75 13.5C3.75 12.12 4.87 11 6.25 11C7.63 11 8.75 12.12 8.75 13.5Z" />
									<path d="M15.75 13.5C15.75 14.88 16.87 16 18.25 16C19.63 16 20.75 14.88 20.75 13.5C20.75 12.12 19.63 11 18.25 11C16.87 11 15.75 12.12 15.75 13.5Z" />
									<path d="M12 11.5C13.1 11.5 14 10.6 14 9.5C14 8.4 13.1 7.5 12 7.5C10.9 7.5 10 8.4 10 9.5C10 10.6 10.9 11.5 12 11.5Z" />
									<path d="M7.5 18C7.5 16.34 9.34 15 11 15H13C14.66 15 16.5 16.34 16.5 18V20H7.5V18Z" />
								</svg>
							</div>
						</div>
						<h1 className="text-3xl font-bold text-gray-900">Nexu</h1>
						<p className="text-gray-600">Create your account</p>
					</div>

					<div className="mb-4 flex items-center">
						<Link
							to="/login"
							className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
						>
							<ArrowLeft className="mr-1 h-4 w-4" />
							Back to login
						</Link>
					</div>

					<div className="rounded-2xl bg-white p-8 shadow-xl">
						<h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
							Create your account
						</h2>

						<form onSubmit={handleSubmit}>
							<div className="grid gap-5 md:grid-cols-2">
								<div className="md:col-span-2">
									{avatarPreview ? (
										<div className="mb-5 flex flex-col items-center">
											<div className="relative mb-2 h-24 w-24 overflow-hidden rounded-full border-4 border-blue-100">
												<img
													src={avatarPreview || "/placeholder.svg"}
													alt="Avatar preview"
													className="h-full w-full object-cover"
												/>
												<button
													type="button"
													onClick={() => {
														setAvatar(null)
														setAvatarPreview(null)
													}}
													className="absolute right-0 top-0 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														className="h-4 w-4"
														viewBox="0 0 20 20"
														fill="currentColor"
													>
														<path
															fillRule="evenodd"
															d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
															clipRule="evenodd"
														/>
													</svg>
												</button>
											</div>
											<span className="text-sm text-gray-500">
												Profile picture
											</span>
										</div>
									) : (
										<div className="mb-5">
											<label className="mb-2 block text-sm font-medium text-gray-700">
												Profile Picture
											</label>
											<label className="group flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition hover:bg-gray-100">
												<div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-500">
													<Upload className="h-6 w-6" />
												</div>
												<p className="mb-1 text-sm font-medium text-gray-700">
													Click to upload
												</p>
												<p className="text-xs text-gray-500">
													SVG, PNG, JPG or GIF (Max. 2MB)
												</p>
												<input
													id="avatar-upload"
													type="file"
													accept="image/*"
													onChange={handleAvatarChange}
													className="hidden"
												/>
											</label>
										</div>
									)}
								</div>

								<div className="mb-4">
									<label className="mb-2 block text-sm font-medium text-gray-700">
										Username
									</label>
									<div className="group relative">
										<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
											<User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
										</div>
										<Input
											type="text"
											placeholder="Choose a username"
											value={username}
											onChange={(e) => setUsername(e.target.value)}
											className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
											required
										/>
									</div>
								</div>

								<div className="mb-4">
									<label className="mb-2 block text-sm font-medium text-gray-700">
										Full Name
									</label>
									<div className="group relative">
										<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
											<User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
										</div>
										<Input
											type="text"
											placeholder="Your full name"
											value={name}
											onChange={(e) => setName(e.target.value)}
											className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
											required
										/>
									</div>
								</div>

								<div className="mb-4 md:col-span-2">
									<label className="mb-2 block text-sm font-medium text-gray-700">
										Email
									</label>
									<div className="group relative">
										<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
											<Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
										</div>
										<Input
											type="email"
											placeholder="Your email address"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
											required
										/>
									</div>
								</div>

								<div className="mb-4 md:col-span-2">
									<label className="mb-2 block text-sm font-medium text-gray-700">
										Password
									</label>
									<div className="group relative">
										<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
											<Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
										</div>
										<Input
											type="password"
											placeholder="Create a password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
											required
										/>
									</div>
									<p className="mt-1 text-xs text-gray-500">
										Must be at least 8 characters
									</p>
								</div>

								<div className="mb-4 md:col-span-2">
									<label className="mb-2 block text-sm font-medium text-gray-700">
										Bio
									</label>
									<textarea
										placeholder="Tell us a little about yourself"
										value={excerpt}
										onChange={(e) => setExcerpt(e.target.value)}
										className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
										rows={3}
									/>
								</div>
							</div>

							<Button
								type="submit"
								className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-medium text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-70"
								disabled={isLoading}
							>
								{isLoading ? (
									<>
										<svg
											className="h-5 w-5 animate-spin text-white"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											></circle>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
										<span>Creating account...</span>
									</>
								) : (
									<span>Create Account</span>
								)}
							</Button>
						</form>
					</div>

					<p className="mt-6 text-center text-sm text-gray-500">
						Already have an account?{" "}
						<Link
							to="/login"
							className="font-medium text-blue-600 hover:underline"
						>
							Sign in
						</Link>
					</p>

					<p className="mt-4 text-center text-xs text-gray-500">
						By creating an account, you agree to Nexu's{" "}
						<a href="#" className="font-medium text-blue-600 hover:underline">
							Terms of Service
						</a>{" "}
						and{" "}
						<a href="#" className="font-medium text-blue-600 hover:underline">
							Privacy Policy
						</a>
						.
					</p>
				</div>
			</div>
		</div>
	)
}
