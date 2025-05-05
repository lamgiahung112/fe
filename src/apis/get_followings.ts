import http from "./client"
import type { User } from "@/types/user"

interface FollowingsResponse {
  data: User[]
  pagination?: {
    total: number
    currentPage: number
    totalPages: number
  }
}

/**
 * Get the current user's followings
 * @param page Optional page number for pagination (defaults to 1)
 * @param limit Optional limit of results per page (defaults to 10)
 * @returns Promise with followings data and pagination info
 */
export default async function getFollowingsApi(page = 1, limit = 10): Promise<FollowingsResponse> {
  try {
    const response = await http.get("/users/me/followings", {
      params: {
        page,
        limit,
      },
    })

    return response.data
  } catch (error) {
    console.error("Error fetching followings:", error)
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
 * Get followings for a specific user
 * @param userId The ID of the user whose followings to fetch
 * @param page Optional page number for pagination (defaults to 1)
 * @param limit Optional limit of results per page (defaults to 10)
 * @returns Promise with followings data and pagination info
 */
export async function getUserFollowingsApi(userId: string, page = 1, limit = 10): Promise<FollowingsResponse> {
  try {
    const response = await http.get(`/users/${userId}/followings`, {
      params: {
        page,
        limit,
      },
    })

    return response.data
  } catch (error) {
    console.error(`Error fetching followings for user ${userId}:`, error)
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
