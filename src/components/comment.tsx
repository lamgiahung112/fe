"use client"

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import type { Comment } from "@/types/comment"
import { type ChangeEvent, useEffect, useRef, useState } from "react"
import getPostCommentsApi from "@/apis/post_comments"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { FileImage, Heart, MessageSquare, Send, Smile, X } from "lucide-react"
import createCommentApi from "@/apis/create_comment"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip"
import useUser from "@/stores/user-store"

interface CommentSectionProps {
	postId: string
	isOpen: boolean
	setIsOpen: (open: boolean) => void
}

export default function CommentSection({
	postId,
	isOpen,
	setIsOpen,
}: CommentSectionProps) {
	const { user } = useUser()
	const [comments, setComments] = useState<Comment[]>([])
	const [newCommentText, setNewCommentText] = useState<string>("")
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [filePreview, setFilePreview] = useState<string | null>(null)
	const [isLoadingComments, setIsLoadingComments] = useState<boolean>(true)
	const commentListRef = useRef<HTMLDivElement>(null)

	const fetchComments = async () => {
		setIsLoadingComments(true)
		try {
			const fetchedComments = await getPostCommentsApi(postId)
			setComments(fetchedComments)
		} catch (error) {
			console.error("Failed to fetch comments:", error)
		} finally {
			setIsLoadingComments(false)
		}
	}

	useEffect(() => {
		if (isOpen) {
			fetchComments()
		}
	}, [isOpen, postId])

	// Scroll to bottom when new comments are added
	useEffect(() => {
		if (commentListRef.current) {
			commentListRef.current.scrollTop = commentListRef.current.scrollHeight
		}
	}, [comments])

	// Create comment handler
	const handleCreateComment = async () => {
		if (!newCommentText.trim() && !selectedFile) return

		setIsLoading(true)
		try {
			await createCommentApi(postId, newCommentText, selectedFile)
			await fetchComments()
			setNewCommentText("")
			setSelectedFile(null)
			setFilePreview(null)
		} catch (error) {
			console.error("Failed to create comment:", error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			// Check file type
			const allowedTypes = [
				"image/jpeg",
				"image/png",
				"image/gif",
				"video/mp4",
				"video/webm",
			]
			if (!allowedTypes.includes(file.type)) {
				alert("Please select a valid image or video file")
				return
			}

			// Check file size (max 10MB)
			if (file.size > 10 * 1024 * 1024) {
				alert("File size should be less than 10MB")
				return
			}

			setSelectedFile(file)

			// Create preview
			const reader = new FileReader()
			reader.onloadend = () => {
				setFilePreview(reader.result as string)
			}
			reader.readAsDataURL(file)
		}
	}

	// Remove selected file
	const handleRemoveFile = () => {
		setSelectedFile(null)
		setFilePreview(null)
		if (fileInputRef.current) {
			fileInputRef.current.value = ""
		}
	}

	// Format timestamp to relative time
	const formatTimestamp = (timestamp: number) => {
		const date = new Date(timestamp * 1000)
		const now = new Date()
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

		if (diffInSeconds < 60) {
			return "just now"
		} else if (diffInSeconds < 3600) {
			const minutes = Math.floor(diffInSeconds / 60)
			return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`
		} else if (diffInSeconds < 86400) {
			const hours = Math.floor(diffInSeconds / 3600)
			return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
		} else if (diffInSeconds < 604800) {
			const days = Math.floor(diffInSeconds / 86400)
			return `${days} ${days === 1 ? "day" : "days"} ago`
		} else {
			return format(date, "MMM d, yyyy")
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="flex max-h-[85vh] flex-col overflow-hidden border border-blue-100 bg-gradient-to-b from-white to-gray-50 p-0 dark:border-blue-900/30 dark:from-gray-900 dark:to-gray-950 sm:max-w-[500px]">
				<DialogHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 dark:border-blue-900/30 dark:from-blue-950/40 dark:to-indigo-950/40">
					<DialogTitle className="flex items-center gap-2 text-xl">
						<MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
						Comments
					</DialogTitle>
				</DialogHeader>

				{/* Comments List */}
				<div
					ref={commentListRef}
					className="max-h-[50vh] min-h-[300px] flex-grow space-y-4 overflow-y-auto scroll-smooth p-6"
				>
					{isLoadingComments ? (
						<div className="flex h-full flex-col items-center justify-center">
							<div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
							<p className="text-muted-foreground">Loading comments...</p>
						</div>
					) : !comments || comments.length === 0 ? (
						<div className="flex h-full flex-col items-center justify-center text-center">
							<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
								<MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
							</div>
							<h3 className="mb-2 text-lg font-medium">No comments yet</h3>
							<p className="max-w-xs text-muted-foreground">
								Be the first to share your thoughts on this post
							</p>
						</div>
					) : (
						comments.map((comment, index) => (
							<div
								key={comment.id}
								className={`flex gap-3 ${
									index !== comments.length - 1
										? "border-b border-gray-100 pb-4 dark:border-gray-800"
										: ""
								}`}
							>
								<Avatar className="h-10 w-10 border border-blue-100 transition-all duration-300 hover:border-blue-300 dark:border-blue-900/30 dark:hover:border-blue-700">
									<AvatarImage
										src={`http://localhost:8080/files/${comment.creatorAvatarUrl}`}
										alt={comment.creatorName}
										onError={(e) => {
											;(e.target as HTMLImageElement).src =
												"/placeholder.svg?height=40&width=40"
										}}
									/>
									<AvatarFallback>
										{comment.creatorName.charAt(0)}
									</AvatarFallback>
								</Avatar>

								<div className="flex-grow space-y-1.5">
									<div className="flex items-center justify-between">
										<div>
											<span className="font-medium text-gray-900 dark:text-gray-100">
												{comment.creatorName}
											</span>
											<span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
												{formatTimestamp(comment.createdAt)}
											</span>
										</div>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<button className="text-gray-400 transition-colors hover:text-red-500">
														<Heart size={16} />
													</button>
												</TooltipTrigger>
												<TooltipContent>
													<p>Like comment</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>

									<div className="rounded-lg bg-gray-100 px-4 py-2.5 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
										<p className="whitespace-pre-wrap break-words">
											{comment.text}
										</p>
									</div>

									{/* Attachment */}
									{comment.attachmentUrl && (
										<div className="mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
											{comment.attachmentUrl.match(/\.(mp4|webm)$/i) ? (
												<video
													src={`http://localhost:8080/files/${comment.attachmentUrl}`}
													controls
													className="max-h-60 max-w-full rounded-lg"
												/>
											) : (
												<img
													src={`http://localhost:8080/files/${comment.attachmentUrl}`}
													alt="Comment attachment"
													className="max-h-60 max-w-full rounded-lg object-cover"
													onClick={() =>
														window.open(
															`http://localhost:8080/files/${comment.attachmentUrl}`,
															"_blank",
														)
													}
													style={{ cursor: "pointer" }}
												/>
											)}
										</div>
									)}
								</div>
							</div>
						))
					)}
				</div>

				{/* Comment Input */}
				<div className="border-t border-blue-100 bg-white p-4 dark:border-blue-900/30 dark:bg-gray-900">
					<div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-1 transition-all focus-within:ring-2 focus-within:ring-blue-500 dark:bg-gray-800">
						<Avatar className="h-8 w-8 border border-blue-100 dark:border-blue-900/30">
							<AvatarImage
								src={
									user?.avatarUrl
										? `http://localhost:8080/files/${user.avatarUrl}`
										: undefined
								}
								alt={user?.name || "User"}
								onError={(e) => {
									;(e.target as HTMLImageElement).src =
										"/placeholder.svg?height=32&width=32"
								}}
							/>
							<AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
						</Avatar>

						<Input
							placeholder="Write a comment..."
							value={newCommentText}
							onChange={(e) => setNewCommentText(e.target.value)}
							onKeyDown={(e) =>
								e.key === "Enter" && !e.shiftKey && handleCreateComment()
							}
							disabled={isLoading}
							className="flex-grow border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
						/>

						<div className="flex items-center gap-1">
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 rounded-full text-gray-500 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30"
											onClick={() => fileInputRef.current?.click()}
											disabled={isLoading}
										>
											<FileImage size={18} />
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p>Add image or video</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>

							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 rounded-full text-gray-500 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30"
											disabled={isLoading}
										>
											<Smile size={18} />
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p>Add emoji</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>

							<Button
								size="sm"
								className={`ml-1 rounded-full ${
									!newCommentText.trim() && !selectedFile
										? "bg-gray-300 dark:bg-gray-700"
										: "bg-blue-600 hover:bg-blue-700"
								}`}
								onClick={handleCreateComment}
								disabled={
									(!newCommentText.trim() && !selectedFile) || isLoading
								}
							>
								{isLoading ? (
									<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
								) : (
									<Send size={16} />
								)}
							</Button>
						</div>

						<input
							type="file"
							ref={fileInputRef}
							onChange={handleFileChange}
							accept="image/jpeg,image/png,image/gif,video/mp4,video/webm"
							className="hidden"
						/>
					</div>

					{/* File Preview - Moved below the input field */}
					{filePreview && (
						<div className="relative mt-3 rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
							<button
								onClick={handleRemoveFile}
								className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-md transition-colors hover:bg-red-600"
								aria-label="Remove file"
							>
								<X size={14} />
							</button>
							{selectedFile?.type.startsWith("video/") ? (
								<video
									src={filePreview}
									controls
									className="mx-auto max-h-48 max-w-full rounded-lg"
								/>
							) : (
								<img
									src={filePreview || "/placeholder.svg"}
									alt="Preview"
									className="mx-auto max-h-48 max-w-full rounded-lg"
								/>
							)}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}
