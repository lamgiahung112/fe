import http from "@/apis/client.ts";

export default function forgetPasswordApi(email: string) {
    return http.post("/forget_password?email=" + email, {})
}