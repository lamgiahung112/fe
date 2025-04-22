import React, { useEffect, useMemo, useRef, useState } from "react"
import {
	SendHorizontal,
	Image,
	MoreVertical,
	Phone,
	Video,
	Search,
	ArrowUp, LogOut, UserPlus, MessageSquare, CheckCircle, Plus
} from "lucide-react"
import { Conversation } from "@/types/conversation.ts"
import getConversationsApi from "@/apis/get_conversations.ts"
import { Message } from "@/types/message.ts"
import getLastMessageApi from "@/apis/get_last_message.ts"
import { format } from "date-fns"
import { User } from "@/types/user.ts"
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
	DialogTitle
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

// Header component for conversation list
const ConversationHeader: React.FC = () => {
	const [isCreateConversationOpen, setIsCreateConversationOpen] = useState<boolean>(false)
	const [usersToAdd, setUsersToAdd] = useState<string[]>([])
	const {
		followers,
	} = useNewsfeed()
	const [conversationName, setConversationName] = useState<string>("")
	const {user} = useUser()

	const handleCreateConversation = () => {
		createConversationApi(conversationName, usersToAdd).then(() => {
			toast.success("Conversation created successfully.")
		}).catch(() => {
			toast.error("Conversation created failed")
		}).finally(() => {
			setIsCreateConversationOpen(false)
			setUsersToAdd([])
			setConversationName("")
		})

	}

	return <div className="p-4 border-b flex items-center justify-between bg-white shadow-sm">
		<h1 className="text-xl font-bold">Chats</h1>
		<div className="flex space-x-2">
			<button onClick={() => setIsCreateConversationOpen(true)} className="p-2 rounded-full hover:bg-gray-100">
				<Plus size={20} />
			</button>
		</div>

		<Dialog open={isCreateConversationOpen} onOpenChange={setIsCreateConversationOpen}>
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
						<div className="h-64 overflow-y-auto border rounded p-2">
							{followers.filter(f => f.id !== user?.id).map((user) => (
								<div key={user.id} className="flex items-center space-x-2 py-2 hover:bg-gray-50 px-2 rounded">
									<Checkbox
										id={`user-${user.id}`}
										checked={usersToAdd.includes(user.id)}
										onCheckedChange={(checked) => {
											if (checked) {
												setUsersToAdd([...usersToAdd, user.id])
											} else {
												setUsersToAdd(usersToAdd.filter(id => id !== user.id))
											}
										}}
									/>
									<div className="flex items-center space-x-2">
										<img
											src={`http://localhost:8080/files/${user.avatarUrl}`}
											alt={user.name}
											className="w-10 h-10 rounded-full object-cover"
										/>
										<div>
											<Label htmlFor={`user-${user.id}`} className="font-medium">{user.name}</Label>
											<p className="text-xs text-gray-500">@{user.username}</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => setIsCreateConversationOpen(false)}>Cancel</Button>
					<Button onClick={handleCreateConversation} disabled={usersToAdd.length === 0}>Create</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	</div>
}


// Props for ConversationItem component
interface ConversationItemProps {
	conversation: Conversation;
	isSelected: boolean;
	onClick: () => void;
}

// Single conversation item component
const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, isSelected, onClick }) => {
	const {user} = useUser()
	const [lastMessage, setLastMessage] = useState<Message | null>(null)

	useEffect(() => {
		const timer = setInterval(() => {
			getLastMessageApi(conversation.id).then(setLastMessage)
		}, 1000)
		return () => {
			clearInterval(timer)
		}
	}, [conversation])

	return (
		<div
			className={`flex cursor-pointer items-center p-3 hover:bg-gray-50 ${
				isSelected ? "bg-blue-50" : ""
			}`}
			onClick={onClick}
		>
			<div className="ml-3 flex-1">
				<div className="flex items-center justify-between">
					<h3 className={`text-lg font-medium `}>{conversation.name}</h3>
					<span className={`'text-gray-500' text-xs`}>
						{format(conversation.updatedAt * 1000, "MMM d, yyyy HH:mm")}
					</span>
				</div>
				<p className={`'text-gray-500'} truncate text-sm`}>
					{!!lastMessage && !!lastMessage.text && `${lastMessage.userName === user?.username ? "You" : lastMessage.userName}: ${lastMessage.text}`}
					{!!lastMessage && !lastMessage.text && lastMessage.attachmentUrl && `${lastMessage.userName === user?.username ? "You" : lastMessage.userName}: sent an attachment`}
					{!lastMessage && "Let's start a conversation"}
				</p>
			</div>
		</div>
	)
}

// Props for ConversationList component
interface ConversationListProps {
	selectedId: string;
	onSelectConversation: (id: string) => void;
	conversations: Conversation[];
}

// Conversation list component
const ConversationList: React.FC<ConversationListProps> = ({ selectedId, onSelectConversation, conversations }) => {
	const [search, setSearch] = useState("")

	return <div className="w-1/3 border-r bg-white flex flex-col">
		<ConversationHeader />
		<div className="p-3">
			<div className="relative">
				<Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
				<input
					value={search}
					type="text"
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search Messenger"
					className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none"
				/>
			</div>
		</div>
		<div className="overflow-y-auto flex-1">
			{conversations?.filter(c => c.name.includes(search))?.map(conversation => (
				<ConversationItem
					key={conversation.id}
					conversation={conversation}
					isSelected={selectedId === conversation.id}
					onClick={() => onSelectConversation(conversation.id)}
				/>
			))}
		</div>
	</div>
}

const PopupMenu: React.FC<{
	isOpen: boolean;
	openDialog: (dialogType: string) => void;
}> = ({ isOpen, openDialog }) => {
	if (!isOpen) return null;

	return (
		<div className="absolute right-0 top-12 bg-white shadow-lg rounded-md border z-50 w-60">
			<ul className="py-1">
				<li
					className="px-4 py-2 hover:bg-gray-100 flex items-center cursor-pointer"
					onClick={() => openDialog('addMember')}
				>
					<UserPlus size={16} className="mr-2" />
					<span>Add Member</span>
				</li>
				<li
					className="px-4 py-2 hover:bg-gray-100 flex items-center cursor-pointer"
					onClick={() => openDialog('changeName')}
				>
					<MessageSquare size={16} className="mr-2" />
					<span>Change Conversation Name</span>
				</li>
				<li
					className="px-4 py-2 hover:bg-gray-100 flex items-center cursor-pointer text-orange-500"
					onClick={() => openDialog('leave')}
				>
					<LogOut size={16} className="mr-2" />
					<span>Leave Chat</span>
				</li>
			</ul>
		</div>
	);
};

// Props for MessageHeader component
interface MessageHeaderProps {
	conversation: Conversation | undefined;
	users: User[]
}

const AddMemberDialog: React.FC<{ isOpen: boolean; onClose: () => void, users: User[], conversation: Conversation }> = ({ isOpen, onClose, users, conversation }) => {
	const {followers} = useNewsfeed()
	const {user} = useUser()
	const [search, setSearch] = useState("")
	const [selectedUsers, setSelectedUsers] = useState<string[]>([])

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add New Member</DialogTitle>
				</DialogHeader>
				<div className="mb-4">
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search users..."
						className="w-full p-2 border rounded-md"
					/>
				</div>
				{
					followers && followers.filter(x => x.id !== user?.id && !users.find(u => u.id === x.id)).map(follower => (
						<div
							key={follower.id}
							onClick={() => {
								if (selectedUsers.includes(follower.id)) {
									setSelectedUsers(selectedUsers.filter(x => x !== follower.id))
									return
								}
								setSelectedUsers(selectedUsers.concat([follower.id]))
							}}
							className="flex items-center space-x-2 cursor-pointer hover:bg-neutral-200 p-4 rounded-sm max-h-[400px] overflow-auto">
							{selectedUsers.includes(follower.id) && <CheckCircle className="w-5 h-5 text-green-500" />}
							{!selectedUsers.includes(follower.id) && (<div className="w-5 h-5"></div>)}
							<img src={`http://localhost:8080/files/${follower.avatarUrl}`} className="w-10 h-10 rounded-full" />
							<h2>{follower.name}</h2>
						</div>
					))
				}
				<div className="flex justify-end space-x-2">
					<button
						className="px-4 py-2 bg-gray-200 rounded-md"
						onClick={onClose}
					>
						Cancel
					</button>
					<button onClick={() => {
						if (!selectedUsers) {
							return
						}
						addUserToConversationApi(conversation.id, selectedUsers).then(() => {
							toast.success("Add user to conversation successfully.")
							users.concat(followers.filter(x => selectedUsers.includes(x.id)))
						}).catch(() => {
							toast.error("Could not add user to conversation.")
						})
					}} className="px-4 py-2 bg-blue-500 text-white rounded-md">
						Add
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

const ChangeConversationNameDialog: React.FC<{ isOpen: boolean; onClose: () => void, conversation: Conversation }> = ({ isOpen, onClose, conversation }) => {
	const [name, setName] = useState("");

	function onClick() {
		changeConversationNameApi(conversation.id, name).then(() => {
			toast.success("Conversation name successfully updated");
		}).catch(() => {
			toast.error("There was an error updating conversation");
		}).finally(() => {
			conversation.name = name;
			onClose()
		})
	}
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Change conversation name</DialogTitle>
				</DialogHeader>
				<div className="mb-4">
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Conversation name"
						className="w-full p-2 border rounded-md"
					/>
				</div>
				<div className="flex justify-end space-x-2">
					<button
						className="px-4 py-2 bg-gray-200 rounded-md"
						onClick={onClose}
					>
						Cancel
					</button>
					<button onClick={onClick} className="px-4 py-2 bg-blue-500 text-white rounded-md">
						Confirm
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

const LeaveChatDialog: React.FC<{ isOpen: boolean; onClose: () => void, conversation: Conversation }> = ({ isOpen, onClose, conversation }) => {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Are you sure you want to leave this chat?</DialogTitle>
				</DialogHeader>
				<div className="flex justify-end space-x-2">
					<button
						className="px-4 py-2 bg-gray-200 rounded-md"
						onClick={onClose}
					>
						Cancel
					</button>
					<button onClick={() => {
						userLeaveConversationApi(conversation.id).then(() => {
							window.location.reload()
						})
					}} className="px-4 py-2 bg-blue-500 text-white rounded-md">
						Confirm
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

// Message header component
const MessageHeader: React.FC<MessageHeaderProps> = ({ conversation, users }) => {
	const [isPopupOpen, setIsPopupOpen] = useState(false);
	const [activeDialog, setActiveDialog] = useState<string | null>(null);

	const togglePopup = () => {
		setIsPopupOpen(!isPopupOpen);
	};

	const closePopup = () => {
		setIsPopupOpen(false);
	};

	const openDialog = (dialogType: string) => {
		setActiveDialog(dialogType);
		closePopup();
	};

	const closeDialog = () => {
		setActiveDialog(null);
	};

	return <div className="p-3 border-b flex items-center justify-between bg-white shadow-sm">
		<div className="flex items-center">
			<div className="flex flex-col ml-3">
				<h2 className="font-semibold">{conversation?.name}</h2>
				<h4 className="text-sm">{users.length ?? 0} thành viên</h4>
			</div>
		</div>
		<div className="flex space-x-4">
			<button className="p-2 rounded-full hover:bg-gray-100">
				<Phone size={20} />
			</button>
			<button className="p-2 rounded-full hover:bg-gray-100">
				<Video size={20} />
			</button>
			<button onClick={togglePopup} className="p-2 rounded-full hover:bg-gray-100 relative">
				<MoreVertical size={20} />
			</button>
			<PopupMenu
				isOpen={isPopupOpen}
				openDialog={openDialog}
			/>
		</div>
		<AddMemberDialog
			isOpen={activeDialog === 'addMember'}
			onClose={closeDialog}
			users={users}
			conversation={conversation!}
			/>
		<ChangeConversationNameDialog
			isOpen={activeDialog === 'changeName'}
			onClose={closeDialog}
			conversation={conversation!}
		/>
		<LeaveChatDialog
			isOpen={activeDialog === 'leave'}
			onClose={closeDialog}
			conversation={conversation!}
		/>
	</div>
}

// Props for MessageBubble component
interface MessageBubbleProps {
	message: Message;
	isCurrentUser: boolean;
}

// Single message bubble component
const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser }) => {
	return <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
		{!isCurrentUser && <img className="w-8 h-8 rounded-full mr-2" src={`http://localhost:8080/files/${message.userAvatarUrl}`} />}
		<div>
			<div>{message.userName}</div>
			<div
				className={`max-w-xs md:max-w-md ${isCurrentUser ? 'bg-blue-500 text-white rounded-t-lg rounded-l-lg' : 'bg-white text-gray-800 rounded-t-lg rounded-r-lg'} p-3 shadow-sm`}>
				{message.text && <p className="text-sm">{message.text}</p>}
				{message.attachmentUrl && (
					<img
						src={`http://localhost:8080/files/${message.attachmentUrl}`}
						alt="Shared image"
						className="rounded mt-1 max-w-full"
					/>
				)}
				<p className="text-xs mt-1 opacity-70 text-right">{format(message.createdAt * 1000, "MMM d, yyyy HH:mm")}</p>
			</div>
		</div>
	</div>
}

// Props for MessageList component
interface MessageListProps {
	messages: Message[];
	setMessages: (message: Message[]) => void;
	conversation: Conversation
}

// Message list component
const MessageList: React.FC<MessageListProps> = ({ messages, setMessages, conversation }) => {
	const {user} = useUser()

	useEffect(() => {
		const timer = setInterval(() => {
			getMessagesApi(0, conversation.id).then((msg) => {
				const newMsg = msg.filter((c) => !messages.find((m) => m.id === c.id))
				if (!newMsg) {
					return null
				}
				setMessages(messages.concat(newMsg))
			})
		}, 2000)
		return () => {
			clearInterval(timer)
		}
	}, [messages])

	function handleLoadMore() {
		getMessagesApi(messages.length, conversation.id).then(msg => {
			setMessages(msg.concat(messages))
		})
	}
	return <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
		<div className="flex flex-col items-center cursor-pointer" onClick={handleLoadMore}>
			<ArrowUp className="h-4 w-4" />
			Load more
		</div>
		<div className="flex flex-col space-y-2">
			{messages?.map(message => (
				<MessageBubble
					key={message.id}
					message={message}
					isCurrentUser={message.userId === user?.id}
				/>
			))}
		</div>
	</div>
}

type MessageInputProps = {
	conversation: Conversation;
	setMessages: (message: Message[]) => void;
}

// Message input component
const MessageInput: React.FC<MessageInputProps> = ({conversation, setMessages}) => {
	const [message, setMessage] = useState("");
	const fileRef = useRef<HTMLInputElement>(null);
	const [file, setFile] = useState<File | null>(null);

	function handleSendMessage() {
		createMessage(conversation.id, file, message)
			.then(() => {
				getMessagesApi(0, conversation.id).then(setMessages)
			})
			.finally(() => {
				setMessage("");
				setFile(null);
			})
	}

	return <div className="border-t p-3 bg-white">
		<div className="flex items-center">
			<button className="p-2 text-gray-600 hover:text-blue-500">
				<input type="file" className="hidden" ref={fileRef} onChange={(e) => {
					if (e.target?.files?.length) {
						setFile(e.target.files[0]);
					}
				}} />
				<Image size={20} onClick={() => {
					fileRef.current?.click();
				}} />
			</button>
			<div className="flex-1 ml-2">
				<input
					type="text"
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && handleSendMessage()}
					placeholder="Aa"
					className="w-full p-2 rounded-full bg-gray-100 focus:outline-none"
				/>
			</div>
			<button
				className="ml-2 p-2 text-blue-500 hover:text-blue-600"
				onClick={handleSendMessage}
			>
				<SendHorizontal size={20} />
			</button>
		</div>
	</div>
}

// Props for MessageContainer component
interface MessageContainerProps {
	conversation: Conversation | undefined;
}

// Message container component
const MessageContainer: React.FC<MessageContainerProps> = ({
	conversation,
}) => {
	const [users, setUsers] = useState<User[]>([])
	const [messages, setMessages] = useState<Message[]>([])
	useEffect(() => {
		if (!conversation) {
			return
		}
		usersInConversationApi(conversation.id).then(setUsers)
		getMessagesApi(0, conversation.id).then(msg => {
			setMessages(msg)
		})
	}, [conversation])

	if (!conversation) {
		return <div></div>;
	}

	return <div className="w-2/3 flex flex-col">
		<MessageHeader conversation={conversation} users={users} />
		<MessageList messages={messages} setMessages={setMessages} conversation={conversation} />
		<MessageInput
			conversation={conversation}
			setMessages={setMessages}
		/>
	</div>
}

// Main component
const MessengerPage: React.FC = () => {
	const [conversations, setConversations] = useState<Conversation[]>([])
	const [selectedConversationId, setSelectedConversationId] = useState<string>("");

	useEffect(() => {
		const timer = setInterval(() => {
			getConversationsApi().then((conv) => {
				setConversations(conv);
				if (conv?.length && !selectedConversationId) {
					setSelectedConversationId(conv[0].id)
				}
			})
		}, 2000)
		return () => {
			clearInterval(timer)
		}
	}, [selectedConversationId])

	const selectedConversation = useMemo(() => conversations.find(x => x.id === selectedConversationId), [selectedConversationId])

	return (
		<div className="flex h-[calc(100vh-66px)] bg-gray-100">
			<ConversationList
				conversations={conversations}
				selectedId={selectedConversationId}
				onSelectConversation={setSelectedConversationId}
			/>
			<MessageContainer
				conversation={selectedConversation}
			/>
		</div>
	);
}

export default MessengerPage;