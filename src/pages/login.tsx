import type React from "react"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { User, Lock, LogIn, ArrowRight, Eye, EyeOff } from "lucide-react"
import useUser from "@/stores/user-store.ts"
import { toast } from "react-toastify"
import { motion } from "framer-motion"

export default function LoginPage() {
	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [formFocus, setFormFocus] = useState<string | null>(null)
	const navigate = useNavigate()

	const { login, isAuthenticated, getDetail } = useUser()

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault()

		if (!username || !password) {
			toast.error("Please enter both username and password")
			return
		}

		setIsLoading(true)
		login(username, password)
			.then(getDetail)
			.catch((error) => {
				toast.error("Login failed. Please check your credentials.")
				console.error("Login error:", error)
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

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.2,
			},
		},
	}

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
	}

	const logoVariants = {
		hidden: { scale: 0.8, opacity: 0 },
		visible: {
			scale: 1,
			opacity: 1,
			transition: { type: "spring", stiffness: 260, damping: 20 },
		},
	}

	const featureVariants = {
		hidden: { x: -20, opacity: 0 },
		visible: (custom: number) => ({
			x: 0,
			opacity: 1,
			transition: { delay: 0.3 + custom * 0.1, duration: 0.5 },
		}),
	}

	return (
		<div className="flex min-h-screen flex-col md:flex-row">
			{/* Left side - Branding/Image */}
			<motion.div
				initial={{ x: -50, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ duration: 0.6 }}
				className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 py-12 md:w-1/2"
			>
				<div className="px-8 text-center">
					<motion.div
						className="mb-6 flex items-center justify-center"
						variants={logoVariants}
						initial="hidden"
						animate="visible"
					>
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
					</motion.div>
					<motion.h1
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.2, duration: 0.5 }}
						className="mb-2 text-4xl font-bold text-white"
					>
						Nexu
					</motion.h1>
					<motion.p
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.3, duration: 0.5 }}
						className="text-xl text-blue-100"
					>
						Connect with friends and the world around you
					</motion.p>

					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						className="mt-12 space-y-6"
					>
						<motion.div
							custom={0}
							variants={featureVariants}
							className="flex items-center space-x-3 text-left text-white"
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/50 backdrop-blur">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="h-6 w-6"
								>
									<path d="M12 16.5C14.21 16.5 16 14.71 16 12.5V6C16 3.79 14.21 2 12 2C9.79 2 8 3.79 8 6V12.5C8 14.71 9.79 16.5 12 16.5Z" />
									<path d="M19 11.5H17V12.5C17 15.26 14.76 17.5 12 17.5C9.24 17.5 7 15.26 7 12.5V11.5H5V12.5C5 16.09 7.86 19.06 11.5 19.46V21.5H9V22.5H15V21.5H12.5V19.46C16.14 19.06 19 16.09 19 12.5V11.5Z" />
								</svg>
							</div>
							<div>
								<h3 className="font-semibold">Share your voice</h3>
								<p className="text-sm text-blue-100">
									Express yourself with posts, photos, and videos
								</p>
							</div>
						</motion.div>

						<motion.div
							custom={1}
							variants={featureVariants}
							className="flex items-center space-x-3 text-left text-white"
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/50 backdrop-blur">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="h-6 w-6"
								>
									<path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" />
									<path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" />
								</svg>
							</div>
							<div>
								<h3 className="font-semibold">Discover communities</h3>
								<p className="text-sm text-blue-100">
									Find groups of people who share your interests
								</p>
							</div>
						</motion.div>

						<motion.div
							custom={2}
							variants={featureVariants}
							className="flex items-center space-x-3 text-left text-white"
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/50 backdrop-blur">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="h-6 w-6"
								>
									<path d="M16 1H8C6.34 1 5 2.34 5 4V20C5 21.66 6.34 23 8 23H16C17.66 23 19 21.66 19 20V4C19 2.34 17.66 1 16 1ZM17 18H7V4H17V18Z" />
									<path d="M12 19C12.5523 19 13 18.5523 13 18C13 17.4477 12.5523 17 12 17C11.4477 17 11 17.4477 11 18C11 18.5523 11.4477 19 12 19Z" />
								</svg>
							</div>
							<div>
								<h3 className="font-semibold">Stay connected</h3>
								<p className="text-sm text-blue-100">
									Chat with friends wherever you are
								</p>
							</div>
						</motion.div>
					</motion.div>
				</div>
			</motion.div>

			{/* Right side - Login Form */}
			<motion.div
				initial={{ x: 50, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ duration: 0.6 }}
				className="flex flex-1 items-center justify-center bg-gray-50 px-6 py-12 md:px-12"
			>
				<div className="w-full max-w-md">
					<div className="mb-8 text-center md:hidden">
						<motion.div
							className="mb-4 flex justify-center"
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ type: "spring", stiffness: 260, damping: 20 }}
						>
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
						</motion.div>
						<motion.h1
							initial={{ y: 20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: 0.2, duration: 0.5 }}
							className="text-3xl font-bold text-gray-900"
						>
							Nexu
						</motion.h1>
						<motion.p
							initial={{ y: 20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: 0.3, duration: 0.5 }}
							className="text-gray-600"
						>
							Connect with friends and the world around you
						</motion.p>
					</div>

					<motion.div
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.5 }}
						className="rounded-2xl bg-white p-8 shadow-xl"
					>
						<motion.h2
							initial={{ y: -10, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: 0.2, duration: 0.5 }}
							className="mb-6 text-center text-2xl font-bold text-gray-900"
						>
							Welcome back
						</motion.h2>

						<motion.form
							variants={containerVariants}
							initial="hidden"
							animate="visible"
							onSubmit={handleSubmit}
						>
							<motion.div variants={itemVariants} className="mb-5">
								<label className="mb-2 block text-sm font-medium text-gray-700">
									Username
								</label>
								<div className="group relative">
									<div
										className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 transition-colors duration-200 ${
											formFocus === "username"
												? "text-blue-500"
												: "text-gray-400"
										}`}
									>
										<User className="h-5 w-5" />
									</div>
									<Input
										type="text"
										placeholder="Enter your username"
										value={username}
										onChange={(e) => setUsername(e.target.value)}
										onFocus={() => setFormFocus("username")}
										onBlur={() => setFormFocus(null)}
										className={`block w-full rounded-lg border py-3 pl-10 pr-3 text-gray-900 transition-all duration-200 focus:ring-2 ${
											formFocus === "username"
												? "border-blue-500 bg-blue-50 focus:ring-blue-200"
												: "border-gray-300 bg-gray-50 focus:ring-blue-100"
										}`}
										required
									/>
								</div>
							</motion.div>

							<motion.div variants={itemVariants} className="mb-5">
								<div className="mb-2 flex items-center justify-between">
									<label className="block text-sm font-medium text-gray-700">
										Password
									</label>
									<motion.div
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
									>
										<Link
											to="/forget_password"
											className="text-xs font-medium text-blue-600 hover:text-blue-800"
										>
											Forgot password?
										</Link>
									</motion.div>
								</div>
								<div className="group relative">
									<div
										className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 transition-colors duration-200 ${
											formFocus === "password"
												? "text-blue-500"
												: "text-gray-400"
										}`}
									>
										<Lock className="h-5 w-5" />
									</div>
									<Input
										type={showPassword ? "text" : "password"}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										onFocus={() => setFormFocus("password")}
										onBlur={() => setFormFocus(null)}
										placeholder="Enter your password"
										className={`block w-full rounded-lg border py-3 pl-10 pr-10 text-gray-900 transition-all duration-200 focus:ring-2 ${
											formFocus === "password"
												? "border-blue-500 bg-blue-50 focus:ring-blue-200"
												: "border-gray-300 bg-gray-50 focus:ring-blue-100"
										}`}
										required
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
									>
										{showPassword ? (
											<EyeOff className="h-5 w-5" />
										) : (
											<Eye className="h-5 w-5" />
										)}
									</button>
								</div>
							</motion.div>

							<motion.div
								variants={itemVariants}
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
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
											<span>Signing in...</span>
										</>
									) : (
										<>
											<LogIn className="h-5 w-5" />
											<span>Sign in</span>
										</>
									)}
								</Button>
							</motion.div>
						</motion.form>

						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.6, duration: 0.5 }}
							className="mt-8"
						>
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-gray-300"></div>
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="bg-white px-2 text-gray-500">
										Don't have an account?
									</span>
								</div>
							</div>

							<motion.div
								className="mt-6"
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								transition={{ type: "spring", stiffness: 400, damping: 17 }}
							>
								<Link
									to="/register"
									className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-3 font-medium text-gray-700 transition-all hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200"
								>
									<span>Create new account</span>
									<ArrowRight className="h-4 w-4" />
								</Link>
							</motion.div>
						</motion.div>
					</motion.div>

					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.8, duration: 0.5 }}
						className="mt-8 text-center text-sm text-gray-500"
					>
						By continuing, you agree to Nexu's{" "}
						<a href="#" className="font-medium text-blue-600 hover:underline">
							Terms of Service
						</a>{" "}
						and{" "}
						<a href="#" className="font-medium text-blue-600 hover:underline">
							Privacy Policy
						</a>
						.
					</motion.p>
				</div>
			</motion.div>
		</div>
	)
}
