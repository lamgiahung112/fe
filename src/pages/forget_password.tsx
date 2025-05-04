import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
	CheckCircle2,
	Code,
	Info,
	Lock,
	Mail,
	ShieldAlert,
	ShieldCheck,
	ArrowLeft,
} from "lucide-react"
import forgetPasswordApi from "@/apis/forget_password"
import resetPasswordApi from "@/apis/change_password"
import { motion, AnimatePresence } from "framer-motion"

export default function ForgetPasswordPage() {
	const [step, setStep] = useState(1)
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [code, setCode] = useState("")
	const [passwordStrength, setPasswordStrength] = useState(0)
	const [passwordFeedback, setPasswordFeedback] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const navigate = useNavigate()

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

	const handleSendEmail = async () => {
		if (email.length === 0 || !email.includes("@")) {
			toast.error("Please enter a valid email address")
			return
		}

		setIsLoading(true)
		try {
			await forgetPasswordApi(email)
			setStep(2)
			toast.success("Verification code has been sent to your email")
		} catch (error) {
			toast.error("Invalid or non-existent email")
		} finally {
			setIsLoading(false)
		}
	}

	const handleResetPassword = async () => {
		if (passwordStrength < 40) {
			toast.error("Password is too weak, please create a stronger password")
			return
		}

		if (!code.trim()) {
			toast.error("Please enter the verification code")
			return
		}

		setIsLoading(true)
		try {
			await resetPasswordApi(email, code, password)
			setStep(3)
			toast.success("Password reset successful!")
			setTimeout(() => navigate("/login"), 2000)
		} catch (error) {
			toast.error("Invalid verification code, please try again")
		} finally {
			setIsLoading(false)
		}
	}

	const fadeIn = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
		exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
			<motion.div
				initial={{ scale: 0.9, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ duration: 0.5 }}
				className="w-full max-w-md"
			>
				<Card className="shadow-lg">
					<CardHeader className="space-y-1">
						<motion.div
							className="mb-2 flex items-center justify-center"
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{
								type: "spring",
								stiffness: 260,
								damping: 20,
								delay: 0.2,
							}}
						>
							<div className="rounded-full bg-blue-100 p-3">
								<Lock className="h-6 w-6 text-blue-600" />
							</div>
						</motion.div>
						<CardTitle className="text-center text-2xl font-bold">
							Reset Password
						</CardTitle>
						<CardDescription className="text-center">
							{step === 1
								? "Enter your email to receive a verification code"
								: step === 2
									? "Enter the verification code and your new password"
									: "Password reset complete"}
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-4">
						{/* Step indicators */}
						<div className="mb-6 flex justify-between">
							<motion.div
								className="flex flex-col items-center"
								animate={{ scale: step === 1 ? 1.05 : 1 }}
								transition={{ duration: 0.3 }}
							>
								<div
									className={`rounded-full p-2 ${
										step >= 1
											? "bg-blue-100 text-blue-600"
											: "bg-gray-100 text-gray-400"
									}`}
								>
									<Mail className="h-5 w-5" />
								</div>
								<span className="mt-1 text-xs">Email</span>
							</motion.div>
							<motion.div
								className="mx-2 flex flex-1 items-center"
								initial={{ scaleX: 0 }}
								animate={{ scaleX: step >= 2 ? 1 : 0 }}
								transition={{ duration: 0.5 }}
								style={{ originX: 0 }}
							>
								<div className="h-1 w-full bg-blue-400"></div>
							</motion.div>
							<motion.div
								className="flex flex-col items-center"
								animate={{ scale: step === 2 ? 1.05 : 1 }}
								transition={{ duration: 0.3 }}
							>
								<div
									className={`rounded-full p-2 ${
										step >= 2
											? "bg-blue-100 text-blue-600"
											: "bg-gray-100 text-gray-400"
									}`}
								>
									<Code className="h-5 w-5" />
								</div>
								<span className="mt-1 text-xs">Verify</span>
							</motion.div>
							<motion.div
								className="mx-2 flex flex-1 items-center"
								initial={{ scaleX: 0 }}
								animate={{ scaleX: step >= 3 ? 1 : 0 }}
								transition={{ duration: 0.5 }}
								style={{ originX: 0 }}
							>
								<div className="h-1 w-full bg-blue-400"></div>
							</motion.div>
							<motion.div
								className="flex flex-col items-center"
								animate={{ scale: step === 3 ? 1.05 : 1 }}
								transition={{ duration: 0.3 }}
							>
								<div
									className={`rounded-full p-2 ${
										step >= 3
											? "bg-blue-100 text-blue-600"
											: "bg-gray-100 text-gray-400"
									}`}
								>
									<CheckCircle2 className="h-5 w-5" />
								</div>
								<span className="mt-1 text-xs">Complete</span>
							</motion.div>
						</div>

						<AnimatePresence mode="wait">
							{step === 1 ? (
								<motion.div
									key="step1"
									initial="hidden"
									animate="visible"
									exit="exit"
									variants={fadeIn}
									className="space-y-4"
								>
									<div className="space-y-2">
										<label className="text-sm font-medium" htmlFor="email">
											Email
										</label>
										<div className="relative">
											<Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
											<Input
												id="email"
												type="email"
												placeholder="name@example.com"
												value={email}
												onChange={(e) => setEmail(e.target.value)}
												className="pl-10"
											/>
										</div>
									</div>

									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.2 }}
									>
										<Alert
											variant="default"
											className="border-blue-200 bg-blue-50"
										>
											<Info className="h-4 w-4 text-blue-500" />
											<AlertDescription className="text-sm text-blue-700">
												We'll send a verification code to your email. Please
												check your spam folder as well.
											</AlertDescription>
										</Alert>
									</motion.div>
								</motion.div>
							) : step === 2 ? (
								<motion.div
									key="step2"
									initial="hidden"
									animate="visible"
									exit="exit"
									variants={fadeIn}
									className="space-y-4"
								>
									<div className="space-y-2">
										<label className="text-sm font-medium" htmlFor="email">
											Email
										</label>
										<div className="relative">
											<Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
											<Input
												id="email"
												type="email"
												value={email}
												disabled
												className="bg-gray-50 pl-10"
											/>
										</div>
									</div>

									<div className="space-y-2">
										<label className="text-sm font-medium" htmlFor="code">
											Verification Code
										</label>
										<div className="relative">
											<Code className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
											<Input
												id="code"
												type="text"
												placeholder="Enter verification code"
												value={code}
												onChange={(e) => setCode(e.target.value)}
												className="pl-10"
											/>
										</div>
									</div>

									<div className="space-y-2">
										<label className="text-sm font-medium" htmlFor="password">
											New Password
										</label>
										<div className="relative">
											<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
											<Input
												id="password"
												type="password"
												placeholder="Create new password"
												value={password}
												onChange={(e) => setPassword(e.target.value)}
												className="pl-10"
											/>
										</div>
									</div>

									{password && (
										<motion.div
											className="space-y-2"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ duration: 0.3 }}
										>
											<div className="flex items-center justify-between">
												<span className="text-sm">Password strength:</span>
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

											<div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
												<motion.div
													className={`h-full ${getPasswordStrengthColor()}`}
													initial={{ width: 0 }}
													animate={{ width: `${passwordStrength}%` }}
													transition={{ duration: 0.5 }}
												/>
											</div>

											<p className="text-xs text-gray-500">
												{passwordFeedback}
											</p>

											<div className="mt-2 grid grid-cols-2 gap-2">
												<motion.div
													className="flex items-center gap-2"
													initial={{ opacity: 0, x: -10 }}
													animate={{ opacity: 1, x: 0 }}
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
													initial={{ opacity: 0, x: -10 }}
													animate={{ opacity: 1, x: 0 }}
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
													initial={{ opacity: 0, x: -10 }}
													animate={{ opacity: 1, x: 0 }}
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
													initial={{ opacity: 0, x: -10 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: 0.4 }}
												>
													<div
														className={`h-2 w-2 rounded-full ${
															/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
																password,
															)
																? "bg-green-500"
																: "bg-gray-300"
														}`}
													></div>
													<span className="text-xs">Special character</span>
												</motion.div>
											</div>
										</motion.div>
									)}
								</motion.div>
							) : (
								<motion.div
									key="step3"
									initial="hidden"
									animate="visible"
									exit="exit"
									variants={fadeIn}
									className="flex flex-col items-center justify-center py-6"
								>
									<motion.div
										initial={{ scale: 0, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										transition={{
											type: "spring",
											stiffness: 260,
											damping: 20,
											delay: 0.2,
										}}
										className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
									>
										<CheckCircle2 className="h-8 w-8 text-green-600" />
									</motion.div>
									<h3 className="mb-2 text-xl font-semibold text-gray-900">
										Password Reset Complete
									</h3>
									<p className="text-center text-gray-600">
										Your password has been reset successfully. You will be
										redirected to the login page shortly.
									</p>
								</motion.div>
							)}
						</AnimatePresence>
					</CardContent>

					<CardFooter>
						{step < 3 ? (
							<Button
								className="w-full"
								onClick={step === 1 ? handleSendEmail : handleResetPassword}
								disabled={isLoading}
							>
								{isLoading ? (
									<span className="flex items-center gap-2">
										<svg
											className="h-4 w-4 animate-spin text-white"
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
										Processing...
									</span>
								) : step === 1 ? (
									"Send Verification Code"
								) : (
									"Reset Password"
								)}
							</Button>
						) : (
							<Button className="w-full" onClick={() => navigate("/login")}>
								Go to Login
							</Button>
						)}
					</CardFooter>
				</Card>

				{step === 1 && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5 }}
					>
						<Button
							variant="link"
							className="mt-4 flex items-center"
							onClick={() => navigate("/login")}
						>
							<ArrowLeft className="mr-1 h-4 w-4" />
							Back to Login
						</Button>
					</motion.div>
				)}
			</motion.div>
		</div>
	)
}
