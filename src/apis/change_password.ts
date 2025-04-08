import http from "@/apis/client.ts";

export default function resetPasswordApi(email:string, code:string, password: string) {
    return http.post(`/change_password?email=${email}&code=${code}&password=${password}`, {})
}