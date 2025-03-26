import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx"
import { Comment } from "@/types/comment.ts"
import { ChangeEvent, useEffect, useRef, useState } from "react"
import getPostCommentsApi from "@/apis/post_comments.ts"
import { Input } from "@/components/ui/input.tsx"
import { Button } from "@/components/ui/button.tsx"
import { format } from "date-fns"
import { FileImage, FileVideo, X } from "lucide-react"
import createCommentApi from "@/apis/create_comment.ts"

interface CommentSectionProps {
	postId: string
	isOpen: boolean
	setIsOpen: (open: boolean) => void
}

export default function CommentSection({postId, isOpen, setIsOpen}: CommentSectionProps) {
	const [comments, setComments] = useState<Comment[]>([])
	const [newCommentText, setNewCommentText] = useState<string>("")
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [filePreview, setFilePreview] = useState<string | null>(null)

	useEffect(() => {
		getPostCommentsApi(postId).then(setComments)
	}, [])

	// Create comment handler
	const handleCreateComment = async () => {
		if (!newCommentText.trim()) return

		setIsLoading(true)
		try {
			await createCommentApi(postId, newCommentText, selectedFile).then(() => getPostCommentsApi(postId)).then(setComments)
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
			const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm']
			if (!allowedTypes.includes(file.type)) {
				alert('Please select a valid image or video file')
				return
			}

			// Check file size (max 10MB)
			if (file.size > 10 * 1024 * 1024) {
				alert('File size should be less than 10MB')
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
			fileInputRef.current.value = ''
		}
	}

	// Render file preview
	const renderFilePreview = () => {
		if (!filePreview) return null

		const isVideo = selectedFile?.type.startsWith('video/')
		return (
			<div className="relative mt-2">
				<button
					onClick={handleRemoveFile}
					className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/75"
				>
					<X size={16} />
				</button>
				{isVideo ? (
					<video
						src={filePreview}
						controls
						className="max-w-full max-h-48 rounded-lg object-cover"
					/>
				) : (
					<img
						src={filePreview}
						alt="Preview"
						className="max-w-full max-h-48 rounded-lg object-cover"
					/>
				)}
			</div>
		)
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Comments</DialogTitle>
				</DialogHeader>
				{/* Comments List */}
				<div className="overflow-y-auto flex-grow">
					{!comments || comments.length === 0 ? (
						<p className="text-center text-gray-500">No comments yet</p>
					) : (
						comments.map((comment) => (
							<div key={comment.id} className="flex space-x-3 mb-4 border-b pb-3">
								{/* Avatar */}
								<img
									src={`http://localhost:8080/files/${comment.creatorAvatarUrl}`}
									alt={comment.creatorName}
									className="w-10 h-10 rounded-full object-cover"
								/>

								{/* Comment Content */}
								<div className="flex-grow">
									<div className="flex items-center space-x-2">
										<span className="font-semibold">{comment.creatorName}</span>
										<span className="text-xs text-gray-500">
                      {format(comment.createdAt * 1000, "MMM d, yyyy HH:mm")}
                    </span>
									</div>
									<p>{comment.text}</p>

									{/* Optional: Attachment */}
									{comment.attachmentUrl && (
										<img
											src={`http://localhost:8080/files/${comment.attachmentUrl}`}
											alt="Comment attachment"
											className="max-w-full mt-2 rounded"
										/>
									)}
								</div>
							</div>
						))
					)}
				</div>
				{/* Comment Input */}
				<div>
					<div className="flex space-x-2 mb-2">
						<Input
							placeholder="Write a comment..."
							value={newCommentText}
							onChange={(e) => setNewCommentText(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && handleCreateComment()}
							disabled={isLoading}
						/>

						{/* File Input */}
						<input
							type="file"
							ref={fileInputRef}
							onChange={handleFileChange}
							accept="image/jpeg,image/png,image/gif,video/mp4,video/webm"
							className="hidden"
						/>
						<Button
							variant="outline"
							size="icon"
							onClick={() => fileInputRef.current?.click()}
							disabled={isLoading}
						>
							{selectedFile?.type.startsWith('video/') ? <FileVideo /> : <FileImage />}
						</Button>

						<Button
							onClick={handleCreateComment}
							disabled={(!newCommentText.trim() && !selectedFile) || isLoading}
						>
							{isLoading ? "Sending..." : "Send"}
						</Button>
					</div>

					{/* File Preview */}
					{filePreview && renderFilePreview()}
				</div>
			</DialogContent>
		</Dialog>
	)
}