import type { Conversation } from "@/components/mini-chat"

// Mock data for conversations
const mockConversations: Conversation[] = [
  {
    id: "1",
    name: "John Doe",
    avatarUrl: "/placeholder.svg?height=40&width=40",
    lastMessage: "Hey, how are you doing?",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    unreadCount: 2,
  },
  {
    id: "2",
    name: "Jane Smith",
    avatarUrl: "/placeholder.svg?height=40&width=40",
    lastMessage: "Can we meet tomorrow?",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    unreadCount: 0,
  },
  {
    id: "3",
    name: "Mike Johnson",
    avatarUrl: "/placeholder.svg?height=40&width=40",
    lastMessage: "I sent you the files",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    unreadCount: 0,
  },
  {
    id: "4",
    name: "Sarah Williams",
    avatarUrl: "/placeholder.svg?height=40&width=40",
    lastMessage: "Thanks for your help!",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    unreadCount: 0,
  },
]

// Function to get conversations
export const getConversationsApi = async (): Promise<Conversation[]> => {
  // In a real app, this would be an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockConversations)
    }, 300)
  })
}

// Function to create a new conversation
export const createConversationApi = async (userId: string): Promise<Conversation> => {
  // In a real app, this would be an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const newConversation: Conversation = {
        id: `new-${Date.now()}`,
        name: `User ${userId}`,
        avatarUrl: "/placeholder.svg?height=40&width=40",
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
      }
      resolve(newConversation)
    }, 300)
  })
}
