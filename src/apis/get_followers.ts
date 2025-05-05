import http from "./client"
import type { User } from "@/types/user"

interface FollowersResponse {
  data: User[]
  pagination?: {
    total: number
    currentPage: number
    totalPages: number
  }
}

/**
 * Get the current user's followers
 * @param page Optional page number for pagination (defaults to 1)
 * @param limit Optional limit of results per page (defaults to 10)
 * @returns Promise with followers data and pagination info
 */
export default async function getFollowersApi(page = 1, limit = 10): Promise<FollowersResponse> {
  try {
    const response = await http.get("/users/me/followers", {
      params: {
        page,
        limit,
      },
    })

    return response.data
  } catch (error) {
    console.error("Error fetching followers:", error)
    // Return empty data structure to avoid breaking the UI
    return {
      data: [],
      pagination: {
        total: 0,
        currentPage: page,
        totalPages: 0,
      },
    }
  }
}

/**
 * Get followers for a specific user
 * @param userId The ID of the user whose followers to fetch
 * @param page Optional page number for pagination (defaults to 1)
 * @param limit Optional limit of results per page (defaults to 10)
 * @returns Promise with followers data and pagination info
 */
export async function getUserFollowersApi(userId: string, page = 1, limit = 10): Promise<FollowersResponse> {
  try {
    const response = await http.get(`/users/${userId}/followers`, {
      params: {
        page,
        limit,
      },
    })

    return response.data
  } catch (error) {
    console.error(`Error fetching followers for user ${userId}:`, error)
    return {
      data: [],
      pagination: {
        total: 0,
        currentPage: page,
        totalPages: 0,
      },
    }
  }
}
