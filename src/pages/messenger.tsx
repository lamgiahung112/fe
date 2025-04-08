import React, { useEffect, useMemo, useState } from "react"
import { SendHorizontal, Paperclip, Image, ChevronLeft, MoreVertical, Phone, Video, Search } from 'lucide-react';
import { Conversation } from "@/types/conversation.ts"
import getConversationsApi from "@/apis/get_conversations.ts"
import { Message } from "@/types/message.ts"
import getLastMessageApi from "@/apis/get_last_message.ts"
import { format } from "date-fns"

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
		<div className="relative">
			<img
				src={conversation.name}
				alt={conversation.name}
				className="w-12 h-12 rounded-full"
			/>
			{conversation.id && (
				<div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
			)}
		</div>
		<div className="ml-3 flex-1">
			<div className="flex justify-between items-center">
				<h3 className={`text-sm `}>{conversation.name}</h3>
				<span className={`text-xs 'text-gray-500'`}>{format(conversation.updatedAt * 1000, "MMM d, yyyy HH:mm")}</span>
			</div>
			<p className={`text-sm truncate 'text-gray-500'}`}>
				{lastMessage?.text}
			</p>
		</div>
	</div>
}

// Props for ConversationList component
interface ConversationListProps {
	selectedId: string;
	onSelectConversation: (id: string) => void;
}

// Conversation list component
const ConversationList: React.FC<ConversationListProps> = ({ selectedId, onSelectConversation }) => {
	const [search, setSearch] = useState("")
	const [conversations, setConversations] = useState<Conversation[]>([])

	useEffect(() => {
		getConversationsApi().then(setConversations)
	}, [])

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
			{conversations.map(conversation => (
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
}

// Message header component
const MessageHeader: React.FC<MessageHeaderProps> = ({ conversation }) => (
	<div className="p-3 border-b flex items-center justify-between bg-white shadow-sm">
		<div className="flex items-center">
			<button className="md:hidden p-1 mr-2 rounded-full hover:bg-gray-100">
				<ChevronLeft size={20} />
			</button>
			{/*<img*/}
			{/*	src={conversation?.avatar}*/}
			{/*	alt={conversation?.name}*/}
			{/*	className="w-10 h-10 rounded-full"*/}
			{/*/>*/}
			<div className="ml-3">
				<h2 className="font-semibold">{conversation?.name}</h2>
				<p className="text-xs text-gray-500">Active now</p>
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
	const isImage = useMemo(() => {
		return message.attachmentUrl.endsWith("png") || message.attachmentUrl.endsWith("webp")
	}, [message.attachmentUrl]);
	return <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
		<div
			className={`max-w-xs md:max-w-md ${isCurrentUser ? 'bg-blue-500 text-white rounded-t-lg rounded-l-lg' : 'bg-white text-gray-800 rounded-t-lg rounded-r-lg'} p-3 shadow-sm`}>
			{message.text && <p className="text-sm">{message.text}</p>}
			{message.attachmentUrl && isImage && (
				<img
					src={message.attachmentUrl}
					alt="Shared image"
					className="rounded mt-1 max-w-full"
				/>
			)}
			{message.attachmentUrl && !isImage && (
				<div className="mt-1 bg-gray-900 rounded relative">
					<div className="aspect-w-16 aspect-h-9">
						<img
							src={"/api/placeholder/300/200"}
							alt="Video thumbnail"
							className="w-full rounded"
						/>
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="w-12 h-12 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
								<div
									className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-gray-800 border-b-8 border-b-transparent ml-1"></div>
							</div>
						</div>
					</div>
				</div>
			)}
			<p className="text-xs mt-1 opacity-70 text-right">{format(message.createdAt * 1000, "MMM d, yyyy HH:mm")}</p>
		</div>
	</div>
}

// Props for MessageList component
interface MessageListProps {
	messages: Message[];
}

// Message list component
const MessageList: React.FC<MessageListProps> = ({ messages }) => (
	<div className="flex-1 overflow-y-auto p-4 bg-gray-100">
		<div className="flex flex-col space-y-2">
			{messages.map(message => (
				<MessageBubble
					key={message.id}
					message={message}
					isCurrentUser={message.id === 'current'}
				/>
			))}
		</div>
	</div>
);

// Props for MessageInput component
interface MessageInputProps {
	newMessage: string;
	setNewMessage: (message: string) => void;
	handleSendMessage: () => void;
}

// Message input component
const MessageInput: React.FC<MessageInputProps> = ({ newMessage, setNewMessage, handleSendMessage }) => (
	<div className="border-t p-3 bg-white">
		<div className="flex items-center">
			<button className="p-2 text-gray-600 hover:text-blue-500">
				<Paperclip size={20} />
			</button>
			<button className="p-2 text-gray-600 hover:text-blue-500">
				<Image size={20} />
			</button>
			<div className="flex-1 ml-2">
				<input
					type="text"
					value={newMessage}
					onChange={(e) => setNewMessage(e.target.value)}
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
);

// Props for MessageContainer component
interface MessageContainerProps {
	conversation: Conversation | undefined;
	messages: Message[];
	newMessage: string;
	setNewMessage: (message: string) => void;
	handleSendMessage: () => void;
}

// Message container component
const MessageContainer: React.FC<MessageContainerProps> = ({
	conversation,
	messages,
	newMessage,
	setNewMessage,
	handleSendMessage
}) => (
	<div className="w-2/3 flex flex-col">
		<MessageHeader conversation={conversation} />
		<MessageList messages={messages} />
		<MessageInput
			newMessage={newMessage}
			setNewMessage={setNewMessage}
			handleSendMessage={handleSendMessage}
		/>
	</div>
);

// Main component
const MessengerPage: React.FC = () => {
	// Sample data for conversations
	const [conversations] = useState<Conversation[]>([
		{
			id: "1",
			name: "John Smith",
			updatedAt: 1,
		},
		{
			id: "2",
			name: "Sarah Johnson",
			updatedAt: 1,
		},
		{
			id: "3",
			name: "Tech Team",
			updatedAt: 1,
		},
		{
			id: "4",
			name: "Emma Wilson",
			updatedAt: 1,
		},
		{
			id: "5",
			name: "David Brown",
			updatedAt: 1,
		}
	]);

	// Sample data for messages in current conversation
	const [messages, setMessages] = useState<Message[]>([]);

	const [selectedConversation, setSelectedConversation] = useState<string>("");
	const [newMessage, setNewMessage] = useState<string>('');

	// Handle sending a new message
	const handleSendMessage = (): void => {
		if (newMessage.trim()) {
			setNewMessage('');
		}
	};

	// Get the current active conversation
	const activeConversation = conversations.find(conv => conv.id === selectedConversation);

	return (
		<div className="flex h-[calc(100vh-66px)] bg-gray-100">
			<ConversationList
				selectedId={selectedConversation}
				onSelectConversation={setSelectedConversation}
			/>
			<MessageContainer
				conversation={activeConversation}
				messages={messages}
				newMessage={newMessage}
				setNewMessage={setNewMessage}
				handleSendMessage={handleSendMessage}
			/>
		</div>
	);
}

export default MessengerPage;