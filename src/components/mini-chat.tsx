import type React from "react"

import { useEffect, useState, useRef } from "react"
import { X, Send, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import useUser from "@/stores/user-store"
import { toast } from "react-toastify"

// Import your existing API functions
import getConversationsApi from "@/apis/get_conversations"
import getMessagesApi from "@/apis/get_messages"
import getLastMessageApi from "@/apis/get_last_message"
import createMessage from "@/apis/create_message"

// Types from your existing code
import type { Conversation } from "@/types/conversation"
import type { Message } from "@/types/message"

const MiniChat: React.FC = () => {
	const { user } = useUser()
	const [showChat, setShowChat] = useState(false)
	const [conversations, setConversations] = useState<Conversation[]>([])
	const [selectedConversation, setSelectedConversation] =
		useState<Conversation | null>(null)
	const [messages, setMessages] = useState<Message[]>([])
	const [messageText, setMessageText] = useState("")
	const [searchQuery, setSearchQuery] = useState("")
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const [isLoading, setIsLoading] = useState(false)

	// Fetch conversations
	useEffect(() => {
		if (showChat) {
			const fetchConversations = async () => {
				try {
					const data = await getConversationsApi()
					setConversations(data)
				} catch (error) {
					console.error("Error fetching conversations:", error)
				}
			}

			fetchConversations()
			const interval = setInterval(fetchConversations, 5000) // Refresh every 5 seconds

			return () => clearInterval(interval)
		}
	}, [showChat])

	// Fetch messages when a conversation is selected
	useEffect(() => {
		if (selectedConversation) {
			const fetchMessages = async () => {
				try {
					const data = await getMessagesApi(0, selectedConversation.id)
					setMessages(data)
					scrollToBottom()
				} catch (error) {
					console.error("Error fetching messages:", error)
				}
			}

			fetchMessages()
			const interval = setInterval(fetchMessages, 3000) // Refresh every 3 seconds

			return () => clearInterval(interval)
		}
	}, [selectedConversation])

	// Scroll to bottom of messages
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
	}

	// Handle sending a message
	const handleSendMessage = async () => {
		if (!messageText.trim() || !selectedConversation || !user) return

		setIsLoading(true)
		try {
			await createMessage(selectedConversation.id, null, messageText)
			setMessageText("")

			// Fetch updated messages
			const updatedMessages = await getMessagesApi(0, selectedConversation.id)
			setMessages(updatedMessages)
			scrollToBottom()
		} catch (error) {
			console.error("Error sending message:", error)
			toast.error("Failed to send message")
		} finally {
			setIsLoading(false)
		}
	}

	// Filter conversations by search query
	const filteredConversations = conversations.filter((conv) =>
		conv.name.toLowerCase().includes(searchQuery.toLowerCase()),
	)

	if (!user) return null

	return (
		<>
			{/* Chat Button */}
			<button
				onClick={() => setShowChat(!showChat)}
				className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
				aria-label="Chat"
			>
				<span className="text-xl">{showChat ? "✕" : "💬"}</span>
			</button>

			{/* Chat Window */}
			{showChat && (
				<div className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[350px] flex-col rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
					{!selectedConversation ? (
						// Conversation List View
						<>
							<div className="flex items-center justify-between border-b border-gray-200 bg-blue-100 p-4 dark:border-gray-700 dark:bg-blue-900">
								<h2 className="text-lg font-semibold text-blue-800 dark:text-white">
									Chats
								</h2>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setShowChat(false)}
								>
									<X className="h-5 w-5" />
								</Button>
							</div>

							<div className="p-3">
								<div className="relative">
									<Search
										className="absolute left-3 top-2.5 text-gray-400"
										size={18}
									/>
									<Input
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										placeholder="Search conversations"
										className="pl-10"
									/>
								</div>
							</div>

							<div className="flex-1 overflow-y-auto">
								{filteredConversations.length > 0 ? (
									filteredConversations.map((conversation) => (
										<ConversationItem
											key={conversation.id}
											conversation={conversation}
											onClick={() => setSelectedConversation(conversation)}
										/>
									))
								) : (
									<div className="flex h-full items-center justify-center">
										<p className="text-gray-500">No conversations found</p>
									</div>
								)}
							</div>
						</>
					) : (
						// Chat View
						<>
							<div className="flex items-center justify-between border-b p-3">
								<div className="flex items-center">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setSelectedConversation(null)}
										className="mr-2"
									>
										<X className="h-4 w-4" />
									</Button>
									<h2 className="font-semibold">{selectedConversation.name}</h2>
								</div>
							</div>

							<div className="flex-1 overflow-y-auto bg-gray-50 p-3 dark:bg-gray-800">
								{messages.length > 0 ? (
									messages.map((message) => (
										<MessageBubble
											key={message.id}
											message={message}
											isCurrentUser={message.userId === user.id}
										/>
									))
								) : (
									<div className="flex h-full items-center justify-center">
										<p className="text-gray-500">
											No messages yet. Start a conversation!
										</p>
									</div>
								)}
								<div ref={messagesEndRef} />
							</div>

							<div className="border-t p-3">
								<form
									className="flex items-center gap-2"
									onSubmit={(e) => {
										e.preventDefault()
										handleSendMessage()
									}}
								>
									<Input
										value={messageText}
										onChange={(e) => setMessageText(e.target.value)}
										placeholder="Type a message..."
										className="flex-1"
										disabled={isLoading}
									/>
									<Button
										type="submit"
										size="icon"
										disabled={!messageText.trim() || isLoading}
										className="bg-blue-600 hover:bg-blue-700"
									>
										<Send className="h-4 w-4" />
									</Button>
								</form>
							</div>
						</>
					)}
				</div>
			)}
		</>
	)
}

// Conversation Item Component
interface ConversationItemProps {
	conversation: Conversation
	onClick: () => void
}

const ConversationItem: React.FC<ConversationItemProps> = ({
	conversation,
	onClick,
}) => {
	const [lastMessage, setLastMessage] = useState<Message | null>(null)
	const { user } = useUser()

	useEffect(() => {
		const fetchLastMessage = async () => {
			try {
				const message = await getLastMessageApi(conversation.id)
				setLastMessage(message)
			} catch (error) {
				console.error("Error fetching last message:", error)
			}
		}

		fetchLastMessage()
		const interval = setInterval(fetchLastMessage, 5000)

		return () => clearInterval(interval)
	}, [conversation.id])

	return (
		<div
			className="flex cursor-pointer items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
			onClick={onClick}
		>
			<div className="ml-3 flex-1 overflow-hidden">
				<div className="flex items-center justify-between">
					<h3 className="font-medium">{conversation.name}</h3>
					<span className="text-xs text-gray-500">
						{format(conversation.updatedAt * 1000, "HH:mm")}
					</span>
				</div>
				<p className="truncate text-sm text-gray-500">
					{lastMessage ? (
						<>
							{lastMessage.userId === user?.id
								? "You: "
								: `${lastMessage.userName}: `}
							{lastMessage.text ||
								(lastMessage.attachmentUrl ? "Sent an attachment" : "")}
						</>
					) : (
						"Start a conversation"
					)}
				</p>
			</div>
		</div>
	)
}

// Message Bubble Component
interface MessageBubbleProps {
	message: Message
	isCurrentUser: boolean
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
	message,
	isCurrentUser,
}) => {
	return (
		<div
			className={`mb-3 flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
		>
			{!isCurrentUser && (
				<img
					src={`http://localhost:8080/files/${message.userAvatarUrl}`}
					alt={message.userName}
					className="mr-2 h-8 w-8 rounded-full object-cover"
					onError={(e) => {
						;(e.target as HTMLImageElement).src =
							"/placeholder.svg?height=32&width=32"
					}}
				/>
			)}
			<div>
				{!isCurrentUser && (
					<div className="mb-1 text-xs text-gray-500">{message.userName}</div>
				)}
				<div
					className={cn(
						"max-w-[200px] rounded-lg p-3 shadow-sm",
						isCurrentUser
							? "rounded-br-none bg-blue-500 text-white"
							: "rounded-bl-none bg-white text-gray-800 dark:bg-gray-700 dark:text-white",
					)}
				>
					{message.text && <p className="text-sm">{message.text}</p>}
					{message.attachmentUrl && (
						<img
							src={`http://localhost:8080/files/${message.attachmentUrl}`}
							alt="Attachment"
							className="mt-2 max-w-full rounded"
							onError={(e) => {
								;(e.target as HTMLImageElement).src =
									"/placeholder.svg?height=150&width=200"
							}}
						/>
					)}
					<p className="mt-1 text-right text-xs opacity-70">
						{format(message.createdAt * 1000, "HH:mm")}
					</p>
				</div>
			</div>
		</div>
	)
}

export default MiniChat
