import http from "./client";

export default function searchByKeywordApi(keyword: string): Promise<{user: string, users: string[], posts: string[]}> {
    return http.get(`/search?keyword=${keyword}`).then(res => res.data.data).catch(() => {
        return {
            user: "",
            users: [],
            posts: []
        }
    })
}