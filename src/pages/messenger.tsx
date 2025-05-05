import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import {
	SendHorizontal,
	ImageIcon,
	MoreVertical,
	Phone,
	Video,
	Search,
	ArrowUp,
	LogOut,
	UserPlus,
	MessageSquare,
	CheckCircle,
	Plus,
	Users,
	ArrowLeft,
} from "lucide-react"
import type { Conversation } from "@/types/conversation.ts"
import getConversationsApi from "@/apis/get_conversations.ts"
import type { Message } from "@/types/message.ts"
import getLastMessageApi from "@/apis/get_last_message.ts"
import { format } from "date-fns"
import type { User } from "@/types/user.ts"
import usersInConversationApi from "@/apis/users_in_conversation.ts"
import getMessagesApi from "@/apis/get_messages.ts"
import createMessage from "@/apis/create_message.ts"
import useUser from "@/stores/user-store.ts"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog.tsx"
import changeConversationNameApi from "@/apis/change_conversation_name.ts"
import { toast } from "react-toastify"
import useNewsfeed from "@/stores/newsfeed-store.ts"
import addUserToConversationApi from "@/apis/add_user_to_conversation.ts"
import userLeaveConversationApi from "@/apis/user_leave_conversation.ts"
import { Label } from "@/components/ui/label.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Checkbox } from "@/components/ui/checkbox.tsx"
import createConversationApi from "@/apis/create_conversation.ts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNavigate } from "react-router-dom"

// Header component for conversation list
const ConversationHeader: React.FC = () => {
	const [isCreateConversationOpen, setIsCreateConversationOpen] =
		useState<boolean>(false)
	const [usersToAdd, setUsersToAdd] = useState<string[]>([])
	const { followers } = useNewsfeed()
	const [conversationName, setConversationName] = useState<string>("")
	const { user } = useUser()

	const handleCreateConversation = () => {
		createConversationApi(conversationName, usersToAdd)
			.then(() => {
				toast.success("Conversation created successfully.")
			})
			.catch(() => {
				toast.error("Conversation creation failed")
			})
			.finally(() => {
				setIsCreateConversationOpen(false)
				setUsersToAdd([])
				setConversationName("")
			})
	}

	return (
		<div className="flex items-center justify-between border-b bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
			<h1 className="text-xl font-bold">Messages</h1>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							onClick={() => setIsCreateConversationOpen(true)}
							variant="ghost"
							size="icon"
							className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
						>
							<Plus size={20} />
							<span className="sr-only">Create new conversation</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Create new conversation</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>

			<Dialog
				open={isCreateConversationOpen}
				onOpenChange={setIsCreateConversationOpen}
			>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Create a conversation</DialogTitle>
						<DialogDescription>
							Select users to start a new conversation with.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="conversationName">Conversation Name</Label>
							<Input
								id="conversationName"
								placeholder="Enter conversation name"
								value={conversationName}
								onChange={(e) => setConversationName(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label>Select Users</Label>
							<ScrollArea className="h-64 rounded border p-2">
								{followers
									.filter((f) => f.id !== user?.id)
									.map((user) => (
										<div
											key={user.id}
											className="flex items-center space-x-2 rounded px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
										>
											<Checkbox
												id={`user-${user.id}`}
												checked={usersToAdd.includes(user.id)}
												onCheckedChange={(checked) => {
													if (checked) {
														setUsersToAdd([...usersToAdd, user.id])
													} else {
														setUsersToAdd(
															usersToAdd.filter((id) => id !== user.id),
														)
													}
												}}
											/>
											<div className="flex items-center space-x-2">
												<Avatar className="h-8 w-8">
													<AvatarImage
														src={`http://localhost:8080/files/${user.avatarUrl}`}
														alt={user.name}
													/>
													<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
												</Avatar>
												<div>
													<Label
														htmlFor={`user-${user.id}`}
														className="font-medium"
													>
														{user.name}
													</Label>
													<p className="text-xs text-gray-500 dark:text-gray-400">
														@{user.username}
													</p>
												</div>
											</div>
										</div>
									))}
							</ScrollArea>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsCreateConversationOpen(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={handleCreateConversation}
							disabled={usersToAdd.length === 0}
						>
							Create
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}

// Props for ConversationItem component
interface ConversationItemProps {
	conversation: Conversation
	isSelected: boolean
	onClick: () => void
}

// Single conversation item component
const ConversationItem: React.FC<ConversationItemProps> = ({
	conversation,
	isSelected,
	onClick,
}) => {
	const { user } = useUser()
	const [lastMessage, setLastMessage] = useState<Message | null>(null)
	const [conversationUsers, setConversationUsers] = useState<User[]>([])

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [message, users] = await Promise.all([
					getLastMessageApi(conversation.id),
					usersInConversationApi(conversation.id),
				])
				setLastMessage(message)
				setConversationUsers(users)
			} catch (error) {
				console.error("Error fetching conversation data:", error)
			}
		}

		fetchData()
		const timer = setInterval(fetchData, 5000)
		return () => clearInterval(timer)
	}, [conversation.id])

	// Get other users in the conversation (excluding current user)
	const otherUsers = conversationUsers.filter((u) => u.id !== user?.id)

	// Format the time to be more user-friendly
	const formatTime = (timestamp: number) => {
		const date = new Date(timestamp * 1000)
		const now = new Date()
		const isToday = date.toDateString() === now.toDateString()

		if (isToday) {
			return format(date, "h:mm a")
		} else {
			return format(date, "MMM d")
		}
	}

	return (
		<div
			className={`flex cursor-pointer items-center p-3 transition-colors
        ${
					isSelected
						? "bg-blue-50 dark:bg-blue-900/30"
						: "bg-white dark:bg-gray-900"
				}
        hover:bg-gray-50 dark:hover:bg-gray-800`}
			onClick={onClick}
		>
			{conversationUsers.length > 2 ? (
				<div className="relative h-12 w-12 flex-shrink-0">
					<div className="absolute left-0 top-0 h-8 w-8 overflow-hidden rounded-full border-2 border-white dark:border-gray-900">
						{conversationUsers[0] && (
							<img
								src={`http://localhost:8080/files/${conversationUsers[0].avatarUrl}`}
								alt={conversationUsers[0].name}
								className="h-full w-full object-cover"
							/>
						)}
					</div>
					<div className="absolute bottom-0 right-0 h-8 w-8 overflow-hidden rounded-full border-2 border-white dark:border-gray-900">
						{conversationUsers[1] && (
							<img
								src={`http://localhost:8080/files/${conversationUsers[1].avatarUrl}`}
								alt={conversationUsers[1].name}
								className="h-full w-full object-cover"
							/>
						)}
					</div>
				</div>
			) : (
				<Avatar className="h-12 w-12 flex-shrink-0">
					{otherUsers[0] && (
						<AvatarImage
							src={`http://localhost:8080/files/${otherUsers[0].avatarUrl}`}
							alt={otherUsers[0].name}
						/>
					)}
					<AvatarFallback>
						{otherUsers[0]
							? otherUsers[0].name.charAt(0)
							: conversation.name.charAt(0)}
					</AvatarFallback>
				</Avatar>
			)}

			<div className="ml-3 flex-1 overflow-hidden">
				<div className="flex items-center justify-between">
					<h3 className="truncate font-medium">
						{conversation.name ||
							otherUsers.map((u) => u.name).join(", ") ||
							"New Conversation"}
					</h3>
					<span className="ml-2 flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
						{formatTime(conversation.updatedAt)}
					</span>
				</div>

				<div className="flex items-center">
					<p className="truncate text-sm text-gray-500 dark:text-gray-400">
						{lastMessage?.text && (
							<span className="flex items-center gap-1">
								{lastMessage.userId === user?.id ? (
									<span className="font-medium text-gray-600 dark:text-gray-300">
										You:{" "}
									</span>
								) : (
									<span className="font-medium text-gray-600 dark:text-gray-300">
										{lastMessage.userName}:{" "}
									</span>
								)}
								{lastMessage.text}
							</span>
						)}
						{!lastMessage?.text && lastMessage?.attachmentUrl && (
							<span className="flex items-center gap-1">
								{lastMessage.userId === user?.id ? (
									<span className="font-medium text-gray-600 dark:text-gray-300">
										You:{" "}
									</span>
								) : (
									<span className="font-medium text-gray-600 dark:text-gray-300">
										{lastMessage.userName}:{" "}
									</span>
								)}
								<ImageIcon size={12} className="mr-1" /> Image
							</span>
						)}
						{!lastMessage && "Start a conversation"}
					</p>
				</div>
			</div>
		</div>
	)
}

// Props for ConversationList component
interface ConversationListProps {
	selectedId: string
	onSelectConversation: (id: string) => void
	conversations: Conversation[]
	isMobile?: boolean
	onBack?: () => void
}

// Conversation list component
const ConversationList: React.FC<ConversationListProps> = ({
	selectedId,
	onSelectConversation,
	conversations,
	isMobile,
	onBack,
}) => {
	const [search, setSearch] = useState("")

	const filteredConversations = conversations?.filter((c) =>
		c.name.toLowerCase().includes(search.toLowerCase()),
	)

	return (
		<div
			className={`flex flex-col border-r bg-white dark:border-gray-700 dark:bg-gray-900 ${
				isMobile ? "w-full" : "w-1/3"
			}`}
		>
			<ConversationHeader />
			<div className="p-3">
				<div className="relative">
					<Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
					<input
						value={search}
						type="text"
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search messages"
						className="w-full rounded-full bg-gray-100 py-2 pl-10 pr-4 text-sm
                text-gray-800 placeholder:text-gray-500 focus:outline-none
                dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
					/>
				</div>
			</div>
			<ScrollArea className="flex-1">
				{filteredConversations?.length === 0 ? (
					<div className="flex h-32 items-center justify-center text-gray-500 dark:text-gray-400">
						<p>No conversations found</p>
					</div>
				) : (
					filteredConversations?.map((conversation) => (
						<ConversationItem
							key={conversation.id}
							conversation={conversation}
							isSelected={selectedId === conversation.id}
							onClick={() => onSelectConversation(conversation.id)}
						/>
					))
				)}
			</ScrollArea>
		</div>
	)
}

const PopupMenu: React.FC<{
	isOpen: boolean
	openDialog: (dialogType: string) => void
}> = ({ isOpen, openDialog }) => {
	if (!isOpen) return null

	return (
		<div className="absolute right-0 top-12 z-50 w-60 rounded-md border bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
			<ul className="py-1">
				<li
					className="flex cursor-pointer items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
					onClick={() => openDialog("addMember")}
				>
					<UserPlus size={16} className="mr-2" />
					<span>Add Member</span>
				</li>
				<li
					className="flex cursor-pointer items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
					onClick={() => openDialog("changeName")}
				>
					<MessageSquare size={16} className="mr-2" />
					<span>Change Conversation Name</span>
				</li>
				<li
					className="flex cursor-pointer items-center px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
					onClick={() => openDialog("leave")}
				>
					<LogOut size={16} className="mr-2" />
					<span>Leave Chat</span>
				</li>
			</ul>
		</div>
	)
}

// Props for MessageHeader component
interface MessageHeaderProps {
	conversation: Conversation | undefined
	users: User[]
	onBack?: () => void
	isMobile?: boolean
}

const AddMemberDialog: React.FC<{
	isOpen: boolean
	onClose: () => void
	users: User[]
	conversation: Conversation
}> = ({ isOpen, onClose, users, conversation }) => {
	const { followers } = useNewsfeed()
	const { user } = useUser()
	const [search, setSearch] = useState("")
	const [selectedUsers, setSelectedUsers] = useState<string[]>([])

	const filteredFollowers = followers.filter(
		(x) =>
			x.id !== user?.id &&
			!users.find((u) => u.id === x.id) &&
			x.name.toLowerCase().includes(search.toLowerCase()),
	)

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add New Member</DialogTitle>
				</DialogHeader>
				<div className="mb-4">
					<Input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search users..."
						className="w-full"
					/>
				</div>
				<ScrollArea className="max-h-[300px]">
					{filteredFollowers.length === 0 ? (
						<div className="py-4 text-center text-gray-500">No users found</div>
					) : (
						filteredFollowers.map((follower) => (
							<div
								key={follower.id}
								onClick={() => {
									if (selectedUsers.includes(follower.id)) {
										setSelectedUsers(
											selectedUsers.filter((x) => x !== follower.id),
										)
										return
									}
									setSelectedUsers(selectedUsers.concat([follower.id]))
								}}
								className="flex cursor-pointer items-center space-x-2 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
							>
								<div className="flex h-5 w-5 items-center justify-center">
									{selectedUsers.includes(follower.id) ? (
										<CheckCircle className="h-5 w-5 text-green-500" />
									) : (
										<div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
									)}
								</div>
								<Avatar className="h-8 w-8">
									<AvatarImage
										src={`http://localhost:8080/files/${follower.avatarUrl}`}
										alt={follower.name}
									/>
									<AvatarFallback>{follower.name.charAt(0)}</AvatarFallback>
								</Avatar>
								<div className="flex-1">
									<h2 className="font-medium">{follower.name}</h2>
								</div>
							</div>
						))
					)}
				</ScrollArea>
				<DialogFooter className="gap-2 sm:gap-0">
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button
						onClick={() => {
							if (!selectedUsers.length) {
								return
							}
							addUserToConversationApi(conversation.id, selectedUsers)
								.then(() => {
									toast.success("Users added to conversation successfully")
									onClose()
								})
								.catch(() => {
									toast.error("Could not add users to conversation")
								})
						}}
						disabled={selectedUsers.length === 0}
					>
						Add
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

const ChangeConversationNameDialog: React.FC<{
	isOpen: boolean
	onClose: () => void
	conversation: Conversation
}> = ({ isOpen, onClose, conversation }) => {
	const { user: currentUser } = useUser()
	const [users, setUsers] = useState<User[]>([])
	const otherUsers = users.filter((u) => u.id !== currentUser?.id)

	useEffect(() => {
		usersInConversationApi(conversation.id).then(setUsers)
	}, [conversation.id])

	const [name, setName] = useState(
		conversation.name || otherUsers.map((u) => u.name).join(", ") || "",
	)

	function handleSubmit() {
		if (!name.trim()) {
			toast.error("Please enter a conversation name")
			return
		}

		changeConversationNameApi(conversation.id, name)
			.then(() => {
				toast.success("Conversation name updated successfully")
				conversation.name = name
				onClose()
			})
			.catch(() => {
				toast.error("Failed to update conversation name")
			})
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Change conversation name</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-2">
					<Input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Enter conversation name"
						className="w-full"
					/>
				</div>
				<DialogFooter className="gap-2 sm:gap-0">
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleSubmit}>Save</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

const LeaveChatDialog: React.FC<{
	isOpen: boolean
	onClose: () => void
	conversation: Conversation
}> = ({ isOpen, onClose, conversation }) => {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Leave Conversation</DialogTitle>
					<DialogDescription>
						Are you sure you want to leave this conversation? You won't receive
						any new messages.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="gap-2 sm:gap-0">
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={() => {
							userLeaveConversationApi(conversation.id)
								.then(() => {
									toast.success("You have left the conversation")
									window.location.reload()
								})
								.catch(() => {
									toast.error("Failed to leave conversation")
								})
						}}
					>
						Leave
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

// Message header component
const MessageHeader: React.FC<MessageHeaderProps> = ({
	conversation,
	users,
	onBack,
	isMobile,
}) => {
	const navigate = useNavigate()
	const [isPopupOpen, setIsPopupOpen] = useState(false)
	const [activeDialog, setActiveDialog] = useState<string | null>(null)
	const { user: currentUser } = useUser()

	const togglePopup = () => {
		setIsPopupOpen(!isPopupOpen)
	}

	const closePopup = () => {
		setIsPopupOpen(false)
	}

	const openDialog = (dialogType: string) => {
		setActiveDialog(dialogType)
		closePopup()
	}

	const closeDialog = () => {
		setActiveDialog(null)
	}

	// Get other users in the conversation (excluding current user)
	const otherUsers = users.filter((u) => u.id !== currentUser?.id)

	if (!conversation) return null

	return (
		<div className="flex items-center justify-between border-b bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
			<div className="flex items-center">
				{isMobile && (
					<Button variant="ghost" size="icon" className="mr-2" onClick={onBack}>
						<ArrowLeft size={20} />
					</Button>
				)}

				{users.length > 2 ? (
					<div className="relative h-10 w-10">
						<div className="absolute left-0 top-0 h-7 w-7 overflow-hidden rounded-full border-2 border-white dark:border-gray-800">
							{users[0] && (
								<img
									src={`http://localhost:8080/files/${users[0].avatarUrl}`}
									alt={users[0].name}
									className="h-full w-full object-cover"
								/>
							)}
						</div>
						<div className="absolute bottom-0 right-0 h-7 w-7 overflow-hidden rounded-full border-2 border-white dark:border-gray-800">
							{users[1] && (
								<img
									src={`http://localhost:8080/files/${users[1].avatarUrl}`}
									alt={users[1].name}
									className="h-full w-full object-cover"
								/>
							)}
						</div>
					</div>
				) : (
					<Avatar className="h-10 w-10">
						{otherUsers[0] && (
							<AvatarImage
								src={`http://localhost:8080/files/${otherUsers[0].avatarUrl}`}
								alt={otherUsers[0].name}
							/>
						)}
						<AvatarFallback>
							{otherUsers[0]
								? otherUsers[0].name.charAt(0)
								: conversation.name.charAt(0)}
						</AvatarFallback>
					</Avatar>
				)}

				<div className="ml-3 flex flex-col">
					<h2 className="font-semibold">
						{conversation.name ||
							otherUsers.map((u) => u.name).join(", ") ||
							"New Conversation"}
					</h2>
					<div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
						<Users size={12} className="mr-1" />
						<span>{users.length} members</span>
						{otherUsers.length > 0 && (
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Badge variant="outline" className="ml-2 cursor-pointer">
											{otherUsers.length} recipients
										</Badge>
									</TooltipTrigger>
									<TooltipContent>
										<div className="max-w-xs">
											<p className="font-semibold">Recipients:</p>
											<ul className="mt-1 list-disc pl-4">
												{otherUsers.map((user) => (
													<li key={user.id}>{user.name}</li>
												))}
											</ul>
										</div>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						)}
					</div>
				</div>
			</div>
			<div className="flex space-x-1">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button variant="ghost" size="icon" className="rounded-full">
								<Phone size={18} />
								<span className="sr-only">Call</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Voice call</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								onClick={() => navigate(`/videocall/${conversation.id}`)}
								variant="ghost"
								size="icon"
								className="rounded-full"
							>
								<Video size={18} />
								<span className="sr-only">Video call</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Video call</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<div className="relative">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="rounded-full"
									onClick={togglePopup}
								>
									<MoreVertical size={18} />
									<span className="sr-only">More options</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>More options</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<PopupMenu isOpen={isPopupOpen} openDialog={openDialog} />
				</div>
			</div>

			{conversation && (
				<>
					<AddMemberDialog
						isOpen={activeDialog === "addMember"}
						onClose={closeDialog}
						users={users}
						conversation={conversation}
					/>
					<ChangeConversationNameDialog
						isOpen={activeDialog === "changeName"}
						onClose={closeDialog}
						conversation={conversation}
					/>
					<LeaveChatDialog
						isOpen={activeDialog === "leave"}
						onClose={closeDialog}
						conversation={conversation}
					/>
				</>
			)}
		</div>
	)
}

// Props for MessageBubble component
interface MessageBubbleProps {
	message: Message
	isCurrentUser: boolean
	showSender: boolean
}

// Single message bubble component
const MessageBubble: React.FC<MessageBubbleProps> = ({
	message,
	isCurrentUser,
	showSender,
}) => {
	return (
		<div
			className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-2`}
		>
			{!isCurrentUser && (
				<Avatar className="mr-2 h-8 w-8 flex-shrink-0 self-end">
					<AvatarImage
						src={`http://localhost:8080/files/${message.userAvatarUrl}`}
						alt={message.userName}
					/>
					<AvatarFallback>{message.userName.charAt(0)}</AvatarFallback>
				</Avatar>
			)}
			<div className={`max-w-[80%]`}>
				{showSender && !isCurrentUser && (
					<div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
						{message.userName}
					</div>
				)}
				<div
					className={`inline-block rounded-2xl px-4 py-2 ${
						isCurrentUser
							? "bg-blue-500 text-white"
							: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
					}`}
				>
					{message.text && <p className="text-sm">{message.text}</p>}
					{message.attachmentUrl && (
						<img
							src={`http://localhost:8080/files/${message.attachmentUrl}`}
							alt="Shared image"
							className="mt-1 max-w-full rounded-lg"
						/>
					)}
					<p className="mt-1 text-right text-xs opacity-70">
						{format(message.createdAt * 1000, "h:mm a")}
					</p>
				</div>
			</div>
		</div>
	)
}

// Props for MessageList component
interface MessageListProps {
	messages: Message[]
	setMessages: (message: Message[]) => void
	conversation: Conversation
}

// Message list component
const MessageList: React.FC<MessageListProps> = ({
	messages,
	setMessages,
	conversation,
}) => {
	const { user } = useUser()
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		const timer = setInterval(() => {
			getMessagesApi(0, conversation.id).then((msg) => {
				const newMsg = msg.filter((c) => !messages.find((m) => m.id === c.id))
				if (newMsg.length > 0) {
					setMessages([...messages, ...newMsg])
				}
			})
		}, 2000)
		return () => {
			clearInterval(timer)
		}
	}, [messages, conversation.id, setMessages])

	useEffect(() => {
		// Scroll to bottom when messages change
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
	}, [messages])

	const handleLoadMore = () => {
		setLoading(true)
		getMessagesApi(messages.length, conversation.id)
			.then((msg) => {
				setMessages([...msg, ...messages])
			})
			.finally(() => {
				setLoading(false)
			})
	}

	// Group messages by sender to avoid showing the sender name for consecutive messages
	const groupedMessages = messages.map((message, index) => {
		const prevMessage = index > 0 ? messages[index - 1] : null
		const showSender = !prevMessage || prevMessage.userId !== message.userId
		return { ...message, showSender }
	})

	return (
		<ScrollArea className="flex-1 bg-white p-4 dark:bg-gray-900">
			{messages.length > 0 && (
				<Button
					variant="ghost"
					size="sm"
					className="mb-4 flex w-full items-center justify-center text-xs text-gray-500"
					onClick={handleLoadMore}
					disabled={loading}
				>
					{loading ? "Loading..." : "Load earlier messages"}
					{!loading && <ArrowUp className="ml-1 h-3 w-3" />}
				</Button>
			)}

			<div className="flex flex-col space-y-1">
				{groupedMessages.map((message) => (
					<MessageBubble
						key={message.id}
						message={message}
						isCurrentUser={message.userId === user?.id}
						showSender={message.showSender}
					/>
				))}
				<div ref={messagesEndRef} />
			</div>

			{messages.length === 0 && (
				<div className="flex h-full items-center justify-center">
					<div className="text-center text-gray-500 dark:text-gray-400">
						<p className="mb-2">No messages yet</p>
						<p className="text-sm">
							Start the conversation by sending a message
						</p>
					</div>
				</div>
			)}
		</ScrollArea>
	)
}

type MessageInputProps = {
	conversation: Conversation
	setMessages: (message: Message[]) => void
}

// Message input component
const MessageInput: React.FC<MessageInputProps> = ({
	conversation,
	setMessages,
}) => {
	const [message, setMessage] = useState("")
	const fileRef = useRef<HTMLInputElement>(null)
	const [file, setFile] = useState<File | null>(null)
	const [isUploading, setIsUploading] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)

	function handleSendMessage() {
		if ((!message.trim() && !file) || isUploading) return

		setIsUploading(true)
		createMessage(conversation.id, file, message)
			.then(() => {
				getMessagesApi(0, conversation.id).then(setMessages)
			})
			.catch(() => {
				toast.error("Failed to send message")
			})
			.finally(() => {
				setMessage("")
				setFile(null)
				setIsUploading(false)
				inputRef.current?.focus()
			})
	}

	return (
		<div className="border-t bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
			{file && (
				<div className="mb-2 flex items-center rounded-md bg-gray-100 p-2 dark:bg-gray-800">
					<div className="flex-1 truncate text-sm">{file.name}</div>
					<Button
						variant="ghost"
						size="sm"
						className="ml-2 h-6 w-6 rounded-full p-0"
						onClick={() => setFile(null)}
					>
						×
					</Button>
				</div>
			)}

			<div className="flex items-center">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="text-gray-500 hover:text-blue-500 dark:text-gray-400"
								onClick={() => fileRef.current?.click()}
								disabled={isUploading}
							>
								<ImageIcon size={20} />
								<span className="sr-only">Attach image</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Attach image</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<input
					type="file"
					className="hidden"
					ref={fileRef}
					accept="image/*"
					onChange={(e) => {
						if (e.target?.files?.length) {
							setFile(e.target.files[0])
						}
					}}
				/>

				<div className="ml-2 flex-1">
					<input
						ref={inputRef}
						type="text"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						onKeyPress={(e: React.KeyboardEvent) =>
							e.key === "Enter" && handleSendMessage()
						}
						placeholder="Type a message..."
						className="w-full rounded-full bg-gray-100 px-4 py-2
              text-sm text-gray-800 placeholder:text-gray-500
              focus:outline-none dark:bg-gray-800 dark:text-white
              dark:placeholder:text-gray-400"
						disabled={isUploading}
					/>
				</div>

				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="ml-2 text-blue-500 hover:text-blue-600 disabled:opacity-50"
								onClick={handleSendMessage}
								disabled={(!message.trim() && !file) || isUploading}
							>
								<SendHorizontal size={20} />
								<span className="sr-only">Send message</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Send message</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
		</div>
	)
}

// Props for MessageContainer component
interface MessageContainerProps {
	conversation: Conversation | undefined
	onBack?: () => void
	isMobile?: boolean
}

// Message container component
const MessageContainer: React.FC<MessageContainerProps> = ({
	conversation,
	onBack,
	isMobile,
}) => {
	const [users, setUsers] = useState<User[]>([])
	const [messages, setMessages] = useState<Message[]>([])

	useEffect(() => {
		if (!conversation) {
			return
		}

		const fetchData = async () => {
			try {
				const [usersData, messagesData] = await Promise.all([
					usersInConversationApi(conversation.id),
					getMessagesApi(0, conversation.id),
				])
				setUsers(usersData)
				setMessages(messagesData)
			} catch (error) {
				console.error("Error fetching conversation data:", error)
			}
		}

		fetchData()
	}, [conversation])

	if (!conversation) {
		return (
			<div
				className={`flex ${
					isMobile ? "hidden" : "w-2/3"
				} items-center justify-center bg-white text-gray-500 dark:bg-gray-900 dark:text-gray-400`}
			>
				<div className="text-center">
					<Users
						size={48}
						className="mx-auto mb-4 text-gray-300 dark:text-gray-600"
					/>
					<p className="text-lg font-medium">Select a conversation</p>
					<p className="mt-1 text-sm">
						Choose from your existing conversations or start a new one
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className={`flex flex-col ${isMobile ? "w-full" : "w-2/3"}`}>
			<MessageHeader
				conversation={conversation}
				users={users}
				onBack={onBack}
				isMobile={isMobile}
			/>
			<MessageList
				messages={messages}
				setMessages={setMessages}
				conversation={conversation}
			/>
			<MessageInput conversation={conversation} setMessages={setMessages} />
		</div>
	)
}

// Main component
const MessengerPage: React.FC = () => {
	const [conversations, setConversations] = useState<Conversation[]>([])
	const [selectedConversationId, setSelectedConversationId] =
		useState<string>("")
	const [isMobile, setIsMobile] = useState(false)
	const [showMobileConversation, setShowMobileConversation] = useState(false)

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768)
		}

		checkMobile()
		window.addEventListener("resize", checkMobile)

		return () => {
			window.removeEventListener("resize", checkMobile)
		}
	}, [])

	useEffect(() => {
		const fetchConversations = async () => {
			try {
				const data = await getConversationsApi()
				setConversations(data)
				if (data?.length && !selectedConversationId) {
					setSelectedConversationId(data[0].id)
				}
			} catch (error) {
				console.error("Error fetching conversations:", error)
			}
		}

		fetchConversations()
		const timer = setInterval(fetchConversations, 5000)

		return () => {
			clearInterval(timer)
		}
	}, [selectedConversationId])

	const selectedConversation = useMemo(
		() => conversations?.find((x) => x.id === selectedConversationId),
		[conversations, selectedConversationId],
	)

	const handleSelectConversation = (id: string) => {
		setSelectedConversationId(id)
		if (isMobile) {
			setShowMobileConversation(true)
		}
	}

	const handleBackToList = () => {
		setShowMobileConversation(false)
	}

	return (
		<div className="flex h-[calc(100vh-66px)] bg-gray-100 dark:bg-gray-950">
			{isMobile ? (
				<>
					{!showMobileConversation && (
						<ConversationList
							conversations={conversations}
							selectedId={selectedConversationId}
							onSelectConversation={handleSelectConversation}
							isMobile={true}
						/>
					)}
					{showMobileConversation && (
						<MessageContainer
							conversation={selectedConversation}
							onBack={handleBackToList}
							isMobile={true}
						/>
					)}
				</>
			) : (
				<>
					<ConversationList
						conversations={conversations}
						selectedId={selectedConversationId}
						onSelectConversation={handleSelectConversation}
					/>
					<MessageContainer conversation={selectedConversation} />
				</>
			)}
		</div>
	)
}

export default MessengerPage
