"use client"

import React from "react"

import { useEffect, useState } from "react"
import {
	User,
	Lock,
	Mail,
	ArrowLeft,
	Upload,
	CheckCircle,
	Eye,
	EyeOff,
	ShieldAlert,
	ShieldCheck,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router-dom"
import useUser from "@/stores/user-store.ts"
import { toast } from "react-toastify"
import { motion } from "framer-motion"

export default function RegisterPage() {
	const [step, setStep] = useState(1)
	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")
	const [name, setName] = useState("")
	const [email, setEmail] = useState("")
	const [excerpt, setExcerpt] = useState("")
	const [avatar, setAvatar] = useState<File | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
	const [showPassword, setShowPassword] = useState(false)
	const [passwordStrength, setPasswordStrength] = useState(0)
	const [passwordFeedback, setPasswordFeedback] = useState("")
	const { register, isAuthenticated } = useUser()
	const navigate = useNavigate()

	// Add a new state for username validation
	const [usernameError, setUsernameError] = useState<string | null>(null)

	// Add a function to validate username format
	const validateUsername = (value: string) => {
		// Check for spaces
		if (/\s/.test(value)) {
			return "Username không được chứa khoảng trắng"
		}

		// Check for special characters (allow only letters, numbers, underscore)
		if (!/^[a-zA-Z0-9_]*$/.test(value)) {
			return "Username không được chứa ký tự đặc biệt"
		}

		// Check if starts with a number
		if (/^[0-9]/.test(value)) {
			return "Username không được bắt đầu bằng số"
		}

		return null
	}

	// Password strength evaluation
	useEffect(() => {
		if (!password) {
			setPasswordStrength(0)
			setPasswordFeedback("")
			return
		}

		// Password criteria
		const hasLowerCase = /[a-z]/.test(password)
		const hasUpperCase = /[A-Z]/.test(password)
		const hasNumber = /[0-9]/.test(password)
		const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
		const isLongEnough = password.length >= 8

		let strength = 0
		if (isLongEnough) strength += 20
		if (hasLowerCase) strength += 20
		if (hasUpperCase) strength += 20
		if (hasNumber) strength += 20
		if (hasSpecialChar) strength += 20

		setPasswordStrength(strength)

		// Password feedback
		if (strength < 40) {
			setPasswordFeedback(
				"Weak password - Add uppercase, numbers, and special characters",
			)
		} else if (strength < 80) {
			setPasswordFeedback("Medium strength - You can improve it further")
		} else {
			setPasswordFeedback("Strong password")
		}
	}, [password])

	const getPasswordStrengthColor = () => {
		if (passwordStrength < 40) return "bg-red-500"
		if (passwordStrength < 80) return "bg-yellow-500"
		return "bg-green-500"
	}

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

	const validateStep = (currentStep: number) => {
		if (currentStep === 1) {
			if (!username.trim()) {
				toast.error("Username is required")
				return false
			}

			const usernameValidationError = validateUsername(username)
			if (usernameValidationError) {
				toast.error(usernameValidationError)
				return false
			}

			if (!name.trim()) {
				toast.error("Full name is required")
				return false
			}
			if (!email.trim()) {
				toast.error("Email is required")
				return false
			}
			if (username === "triko") {
				toast.error("Username already exists!")
				return false
			}
			return true
		}

		// Rest of the function remains unchanged
		if (currentStep === 2) {
			if (!password.trim()) {
				toast.error("Password is required")
				return false
			}
			if (passwordStrength < 40) {
				toast.error("Password is too weak. Please create a stronger password.")
				return false
			}
			return true
		}

		if (currentStep === 3) {
			if (!avatar) {
				toast.error("Profile picture is required")
				return false
			}
			return true
		}

		return true
	}

	const nextStep = () => {
		if (validateStep(step)) {
			setStep(step + 1)
		}
	}

	const prevStep = () => {
		setStep(step - 1)
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		if (!validateStep(step)) {
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

	const fadeIn = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
	}

	const renderStepIndicator = () => {
		return (
			<div className="mb-6 flex justify-center">
				<div className="flex items-center space-x-2">
					{[1, 2, 3].map((i) => (
						<React.Fragment key={i}>
							<motion.div
								className={`flex h-8 w-8 items-center justify-center rounded-full ${
									step >= i
										? "bg-blue-600 text-white"
										: "bg-gray-200 text-gray-500"
								}`}
								animate={{ scale: step === i ? [1, 1.1, 1] : 1 }}
								transition={{ duration: 0.3 }}
							>
								{i}
							</motion.div>
							{i < 3 && (
								<div
									className={`h-1 w-10 ${
										step > i ? "bg-blue-600" : "bg-gray-200"
									}`}
								></div>
							)}
						</React.Fragment>
					))}
				</div>
			</div>
		)
	}

	const renderStepContent = () => {
		switch (step) {
			case 1:
				return (
					<motion.div
						key="step1"
						initial="hidden"
						animate="visible"
						variants={fadeIn}
						className="space-y-4"
					>
						<h3 className="text-lg font-medium">Basic Information</h3>

						<div className="space-y-4">
							<div className="group relative">
								<label className="mb-1 block text-sm font-medium text-gray-700">
									Username
								</label>
								<div className="relative">
									<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
										<User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
									</div>
									<Input
										type="text"
										placeholder="Choose a username"
										value={username}
										onChange={(e) => {
											const value = e.target.value
											setUsername(value)
											setUsernameError(validateUsername(value))
										}}
										className={`block w-full rounded-lg border ${
											usernameError
												? "border-red-300 focus:border-red-500 focus:ring-red-500"
												: "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
										} bg-gray-50 py-3 pl-10 pr-3 text-gray-900`}
										required
									/>
								</div>
								{usernameError && (
									<motion.p
										className="mt-1 text-sm text-red-600"
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.2 }}
									>
										{usernameError}
									</motion.p>
								)}
							</div>

							<div className="group relative">
								<label className="mb-1 block text-sm font-medium text-gray-700">
									Full Name
								</label>
								<div className="relative">
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

							<div className="group relative">
								<label className="mb-1 block text-sm font-medium text-gray-700">
									Email
								</label>
								<div className="relative">
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
						</div>
					</motion.div>
				)
			case 2:
				return (
					<motion.div
						key="step2"
						initial="hidden"
						animate="visible"
						variants={fadeIn}
						className="space-y-4"
					>
						<h3 className="text-lg font-medium">Security</h3>

						<div className="space-y-4">
							<div className="group relative">
								<label className="mb-1 block text-sm font-medium text-gray-700">
									Password
								</label>
								<div className="relative">
									<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
										<Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
									</div>
									<Input
										type={showPassword ? "text" : "password"}
										placeholder="Create a password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-10 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
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

								{/* Password strength indicator */}
								{password && (
									<div className="mt-3 space-y-2">
										<div className="flex items-center justify-between">
											<span className="text-sm font-medium">
												Password strength:
											</span>
											<span className="flex items-center gap-1 text-sm font-medium">
												{passwordStrength < 40 ? (
													<>
														<ShieldAlert className="h-4 w-4 text-red-500" />{" "}
														Weak
													</>
												) : passwordStrength < 80 ? (
													<>
														<ShieldAlert className="h-4 w-4 text-yellow-500" />{" "}
														Medium
													</>
												) : (
													<>
														<ShieldCheck className="h-4 w-4 text-green-500" />{" "}
														Strong
													</>
												)}
											</span>
										</div>

										{/* Progress bar */}
										<motion.div
											className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ duration: 0.3 }}
										>
											<motion.div
												className={`h-full ${getPasswordStrengthColor()}`}
												initial={{ width: 0 }}
												animate={{ width: `${passwordStrength}%` }}
												transition={{ duration: 0.3 }}
											></motion.div>
										</motion.div>

										<p className="text-xs text-gray-500">{passwordFeedback}</p>

										{/* Password requirements */}
										<div className="mt-2 grid grid-cols-2 gap-2">
											<motion.div
												className="flex items-center gap-2"
												animate={{ opacity: 1 }}
												initial={{ opacity: 0 }}
												transition={{ delay: 0.1 }}
											>
												<div
													className={`h-2 w-2 rounded-full ${
														password.length >= 8
															? "bg-green-500"
															: "bg-gray-300"
													}`}
												></div>
												<span className="text-xs">At least 8 characters</span>
											</motion.div>
											<motion.div
												className="flex items-center gap-2"
												animate={{ opacity: 1 }}
												initial={{ opacity: 0 }}
												transition={{ delay: 0.2 }}
											>
												<div
													className={`h-2 w-2 rounded-full ${
														/[A-Z]/.test(password)
															? "bg-green-500"
															: "bg-gray-300"
													}`}
												></div>
												<span className="text-xs">Uppercase letter</span>
											</motion.div>
											<motion.div
												className="flex items-center gap-2"
												animate={{ opacity: 1 }}
												initial={{ opacity: 0 }}
												transition={{ delay: 0.3 }}
											>
												<div
													className={`h-2 w-2 rounded-full ${
														/[0-9]/.test(password)
															? "bg-green-500"
															: "bg-gray-300"
													}`}
												></div>
												<span className="text-xs">Number</span>
											</motion.div>
											<motion.div
												className="flex items-center gap-2"
												animate={{ opacity: 1 }}
												initial={{ opacity: 0 }}
												transition={{ delay: 0.4 }}
											>
												<div
													className={`h-2 w-2 rounded-full ${
														/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
															? "bg-green-500"
															: "bg-gray-300"
													}`}
												></div>
												<span className="text-xs">Special character</span>
											</motion.div>
										</div>
									</div>
								)}
							</div>

							<div className="group relative">
								<label className="mb-1 block text-sm font-medium text-gray-700">
									Bio (Optional)
								</label>
								<textarea
									placeholder="Tell us a little about yourself"
									value={excerpt}
									onChange={(e) => setExcerpt(e.target.value)}
									className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
									rows={2}
								/>
							</div>
						</div>
					</motion.div>
				)
			case 3:
				return (
					<motion.div
						key="step3"
						initial="hidden"
						animate="visible"
						variants={fadeIn}
						className="space-y-4"
					>
						<h3 className="text-lg font-medium">Profile Picture</h3>

						<div className="flex flex-col items-center justify-center">
							{avatarPreview ? (
								<div className="mb-5 flex flex-col items-center">
									<motion.div
										className="relative mb-2 h-24 w-24 overflow-hidden rounded-full border-4 border-blue-100"
										initial={{ scale: 0.8, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										transition={{ type: "spring", stiffness: 260, damping: 20 }}
									>
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
									</motion.div>
									<span className="text-sm text-gray-500">Profile picture</span>
								</div>
							) : (
								<div className="mb-5 w-full">
									<motion.label
										className="group flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition hover:bg-gray-100"
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
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
									</motion.label>
								</div>
							)}

							<p className="mt-2 text-center text-sm text-gray-500">
								This will be displayed on your profile and in your posts
							</p>
						</div>
					</motion.div>
				)
			default:
				return null
		}
	}

	return (
		<div className="flex min-h-screen flex-col md:flex-row">
			{/* Left side - Branding/Image */}
			<div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 py-12 md:w-1/2">
				<div className="px-8 text-center">
					<motion.div
						className="mb-6 flex items-center justify-center"
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ type: "spring", stiffness: 260, damping: 20 }}
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
						className="mb-2 text-4xl font-bold text-white"
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.1 }}
					>
						Nexu
					</motion.h1>
					<motion.p
						className="text-xl text-blue-100"
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.2 }}
					>
						Join our community today
					</motion.p>

					<div className="mt-12 space-y-6">
						<motion.div
							className="flex items-center space-x-3 text-left text-white"
							initial={{ x: -20, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							transition={{ delay: 0.3 }}
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/50 backdrop-blur">
								<CheckCircle className="h-6 w-6" />
							</div>
							<div>
								<h3 className="font-semibold">Create your profile</h3>
								<p className="text-sm text-blue-100">
									Showcase your interests and personality
								</p>
							</div>
						</motion.div>

						<motion.div
							className="flex items-center space-x-3 text-left text-white"
							initial={{ x: -20, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							transition={{ delay: 0.4 }}
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/50 backdrop-blur">
								<CheckCircle className="h-6 w-6" />
							</div>
							<div>
								<h3 className="font-semibold">Connect with friends</h3>
								<p className="text-sm text-blue-100">
									Find and follow people you know
								</p>
							</div>
						</motion.div>

						<motion.div
							className="flex items-center space-x-3 text-left text-white"
							initial={{ x: -20, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							transition={{ delay: 0.5 }}
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/50 backdrop-blur">
								<CheckCircle className="h-6 w-6" />
							</div>
							<div>
								<h3 className="font-semibold">Join the conversation</h3>
								<p className="text-sm text-blue-100">
									Share your thoughts and experiences
								</p>
							</div>
						</motion.div>
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

					<motion.div
						className="rounded-2xl bg-white p-8 shadow-xl"
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.5 }}
					>
						<h2 className="mb-4 text-center text-2xl font-bold text-gray-900">
							Create your account
						</h2>

						{renderStepIndicator()}

						<form onSubmit={handleSubmit}>
							{renderStepContent()}

							<div className="mt-8 flex justify-between">
								{step > 1 && (
									<Button
										type="button"
										variant="outline"
										onClick={prevStep}
										className="px-4 py-2"
									>
										Back
									</Button>
								)}

								{step < 3 ? (
									<Button
										type="button"
										onClick={nextStep}
										className="ml-auto px-4 py-2"
									>
										Continue
									</Button>
								) : (
									<Button
										type="submit"
										className="ml-auto flex items-center justify-center gap-2 px-4 py-2"
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
								)}
							</div>
						</form>
					</motion.div>

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
