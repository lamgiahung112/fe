import {useState} from "react";
import forgetPasswordApi from "@/apis/forget_password.ts";
import {toast} from "react-toastify";
import {Input} from "@/components/ui/input.tsx";
import {Code, Lock, User} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import resetPasswordApi from "@/apis/change_password.ts";
import {useNavigate} from "react-router-dom";

export default function ForgetPasswordPage() {
    const [isEmailSent, setIsEmailSent] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [code, setCode] = useState("")
    const navigate = useNavigate();

    const handleSendEmail = () => {
        if (email.length === 0 || !email.includes("@")) {
            toast.error("Please enter a valid email address")
            return
        }
        forgetPasswordApi(email)
            .then(() => {
                setIsEmailSent(true)
            })
            .catch(() => {
                setIsEmailSent(false)
                toast.error("Email is invalid or doesn't exists")
            })
    }

    const handleResetPassword = () => {
        if (password.length < 8 || !password.includes("!")) {
            toast.error("Password is not strong enough, please try again")
            return
        }
        resetPasswordApi(email, code, password)
        .then(() => {
            navigate("/login")
        })
        .catch(() => {
            toast.error("Code is invalid, please try again")
        })
    }

    if (!isEmailSent) {
        return <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-md">
                <h2 className="mb-4 text-center text-2xl font-semibold text-gray-800">
                    Reset Password
                </h2>

                <div className="mb-4">
                    <label className="mb-1 block font-medium text-gray-700">
                        Email
                    </label>
                    <div className="flex items-center rounded-lg border bg-gray-50 px-3 py-2">
                        <User className="h-5 w-5 text-gray-500" />
                        <Input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 border-none bg-transparent outline-none focus:ring-0 focus-visible:ring-0"
                        />
                    </div>
                </div>

                <Button className="mt-4 w-full" onClick={handleSendEmail}>
                    Send Email
                </Button>
            </div>
        </div>
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-md">
                <h2 className="mb-4 text-center text-2xl font-semibold text-gray-800">
                    Reset Password for {email}
                </h2>

                <div className="mb-4">
                    <label className="mb-1 block font-medium text-gray-700">
                        Code
                    </label>
                    <div className="flex items-center rounded-lg border bg-gray-50 px-3 py-2">
                        <Code className="h-5 w-5 text-gray-500" />
                        <Input
                            type="text"
                            placeholder="Enter your password-reset code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
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
                            placeholder="Enter your new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="flex-1 border-none bg-transparent outline-none focus:ring-0 focus-visible:ring-0"
                        />
                    </div>
                </div>

                <Button className="mt-4 w-full" onClick={handleResetPassword}>
                    Reset Password
                </Button>
            </div>
        </div>
    )
}