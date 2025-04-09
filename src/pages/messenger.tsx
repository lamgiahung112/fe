import React, { useEffect, useMemo, useRef, useState } from "react"
import {
	SendHorizontal,
	Image,
	MoreVertical,
	Phone,
	Video,
	Search,
	ArrowUp
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

// Header component for conversation list
const ConversationHeader: React.FC = () => (
	<div className="p-4 border-b flex items-center justify-between bg-white shadow-sm">
		<h1 className="text-xl font-bold">Chats</h1>
		<div className="flex space-x-2">
			<button className="p-2 rounded-full hover:bg-gray-100">
				<MoreVertical size={20} />
			</button>
		</div>
	</div>
);


// Props for ConversationItem component
interface ConversationItemProps {
	conversation: Conversation;
	isSelected: boolean;
	onClick: () => void;
}

// Single conversation item component
const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, isSelected, onClick }) => {
	const [lastMessage, setLastMessage] = useState<Message | null>(null)

	useEffect(() => {
		const timer = setInterval(() => {
			getLastMessageApi(conversation.id).then(setLastMessage)
		}, 1000)
		return () => {
			clearInterval(timer)
		}
	}, [conversation])

	return <div
		className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
		onClick={onClick}
	>
		<div className="ml-3 flex-1">
			<div className="flex justify-between items-center">
				<h3 className={`text-lg font-medium `}>{conversation.name}</h3>
				<span className={`text-xs 'text-gray-500'`}>{format(conversation.updatedAt * 1000, "MMM d, yyyy HH:mm")}</span>
			</div>
			<p className={`text-sm truncate 'text-gray-500'}`}>
				{!!lastMessage && !!lastMessage.text && lastMessage.text}
				{!lastMessage && "Let's start a conversation"}
			</p>
		</div>
	</div>
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

// Props for MessageHeader component
interface MessageHeaderProps {
	conversation: Conversation | undefined;
	users: User[]
}

// Message header component
const MessageHeader: React.FC<MessageHeaderProps> = ({ conversation, users }) => (
	<div className="p-3 border-b flex items-center justify-between bg-white shadow-sm">
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
			<button className="p-2 rounded-full hover:bg-gray-100">
				<MoreVertical size={20} />
			</button>
		</div>
	</div>
);

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
		getMessagesApi(messages.length, conversation.id).then(msg => {
			setMessages(messages.concat(msg))
		})
	}, [conversation])

	if (!conversation) {
		return <div>Loading...</div>;
	}

	return <div className="w-2/3 flex flex-col">
		{JSON.stringify(users)}
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
	}, [])
	const [selectedConversationId, setSelectedConversationId] = useState<string>("");

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