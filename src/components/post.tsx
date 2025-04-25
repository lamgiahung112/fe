"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardFooter } from "./ui/card"
import type { Post } from "@/types/post"
import type { User } from "@/types/user"
import postByIdApi from "@/apis/post_by_id"
import getPostCreatorApi from "@/apis/get_post_creator"
import { format } from "date-fns"
import { Button } from "./ui/button"
import {
	Camera,
	Heart,
	MessageCircle,
	MoreHorizontal,
	RefreshCw,
	Trash2,
	Lock,
	Globe,
} from "lucide-react"
import likePostApi from "@/apis/like_post"
import unlikePostApi from "@/apis/unlike_post"
import { cn } from "@/lib/utils"
import CommentSection from "@/components/comment.tsx"
import { Link } from "react-router-dom"
import useUser from "@/stores/user-store.ts"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog.tsx"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx"
import { Label } from "@/components/ui/label.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Switch } from "@/components/ui/switch.tsx"
import updatePostApi from "@/apis/update_post.ts"
import { toast } from "react-toastify"
import deletePostApi from "@/apis/delete_post.ts"
import { Separator } from "./ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

interface PostProps {
	postId: string
}

export default function PostUI({ postId }: PostProps) {
	const [post, setPost] = useState<Post | null>(null)
	const [user, setUser] = useState<User | null>(null)
	const { user: currentUser } = useUser()
	const [canEditPost, setCanEditPost] = useState<boolean>(false)
	const [isCommentOpen, setIsCommentOpen] = useState(false)
	const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [dropdownMenuOpen, setDropdownMenuOpen] = useState(false)
	const [postToUpdate, setPostToUpdate] = useState<Post | null>(null)
	const [file, setFile] = useState<File | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true)
			try {
				const [postData, userData] = await Promise.all([
					postByIdApi(postId),
					getPostCreatorApi(postId),
				])
				setPost(postData)
				setPostToUpdate(postData)
				setUser(userData)
			} catch (error) {
				console.error("Error fetching post data:", error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchData()
	}, [postId])

	useEffect(() => {
		if (user && currentUser && user.id === currentUser.id) {
			setCanEditPost(true)
			return
		}
		setCanEditPost(false)
	}, [user, currentUser])

	if (isLoading) {
		return (
			<Card className="w-full overflow-hidden">
				<CardHeader className="flex animate-pulse flex-row items-center gap-4 pb-3">
					<div className="h-10 w-10 rounded-full bg-muted"></div>
					<div className="flex-1 space-y-2">
						<div className="h-4 w-1/4 rounded bg-muted"></div>
						<div className="h-3 w-1/3 rounded bg-muted"></div>
					</div>
				</CardHeader>
				<CardContent className="space-y-4 pb-3">
					<div className="h-4 w-full rounded bg-muted"></div>
					<div className="h-4 w-3/4 rounded bg-muted"></div>
					<div className="h-64 w-full rounded-lg bg-muted"></div>
				</CardContent>
				<CardFooter className="border-t pt-3">
					<div className="flex w-full gap-2">
						<div className="h-9 flex-1 rounded bg-muted"></div>
						<div className="h-9 flex-1 rounded bg-muted"></div>
					</div>
				</CardFooter>
			</Card>
		)
	}

	if (!post || !user) {
		return null
	}

	const formatDate = (timestamp: number) => {
		const date = new Date(timestamp * 1000)
		return format(date, "MMM d, yyyy 'at' h:mm a")
	}

	const handleLikeToggle = async () => {
		try {
			if (!post.isLiked) {
				await likePostApi(post.id)
				setPost({
					...post,
					isLiked: true,
					likeCount: post.likeCount + 1,
				})
			} else {
				await unlikePostApi(post.id)
				setPost({
					...post,
					isLiked: false,
					likeCount: post.likeCount - 1,
				})
			}
		} catch (error) {
			toast.error("Failed to update like status")
		}
	}

	const handleUpdatePost = async () => {
		if (!postToUpdate) return

		try {
			await updatePostApi(
				postToUpdate.id,
				postToUpdate.caption,
				postToUpdate.attachmentUrl,
				file,
				postToUpdate.isPrivate,
			)
			toast.success("Post updated successfully")

			const updatedPost = await postByIdApi(postId)
			setPost(updatedPost)
			setPostToUpdate(updatedPost)
		} catch (error) {
			toast.error("Failed to update post")
		} finally {
			setUpdateDialogOpen(false)
			setFile(null)
		}
	}

	const handleDeletePost = async () => {
		try {
			await deletePostApi(postId)
			toast.success("Post deleted successfully")
			window.location.reload()
		} catch (error) {
			toast.error("Failed to delete post")
		} finally {
			setDeleteDialogOpen(false)
		}
	}

	return (
		<Card className="overflow-hidden border shadow-sm">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 border-b-2 border-slate-200 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 pb-3 dark:border-slate-700 dark:from-blue-950/30 dark:to-indigo-950/30">
				<div className="flex items-center gap-3">
					<Link to={`/users/${user.id}`}>
						<Avatar className="h-10 w-10 border">
							<AvatarImage
								src={`http://localhost:8080/files/${user.avatarUrl}`}
								alt={`${user.name}'s avatar`}
							/>
							<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
						</Avatar>
					</Link>
					<div className="flex flex-col">
						<Link
							to={`/users/${user.id}`}
							className="font-medium hover:underline"
						>
							{user.name}
						</Link>
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<Link to={`/post?post=${post.id}`} className="hover:underline">
								{formatDate(post.createdAt)}
							</Link>
							<span className="flex items-center gap-1">
								{post.isPrivate ? (
									<>
										<Lock size={12} />
										<span>Private</span>
									</>
								) : (
									<>
										<Globe size={12} />
										<span>Public</span>
									</>
								)}
							</span>
						</div>
					</div>
				</div>

				{canEditPost && (
					<DropdownMenu
						open={dropdownMenuOpen}
						onOpenChange={setDropdownMenuOpen}
					>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 rounded-full"
							>
								<MoreHorizontal size={16} />
								<span className="sr-only">Post options</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-48">
							<DropdownMenuItem
								className="flex cursor-pointer items-center gap-2"
								onClick={() => {
									setDropdownMenuOpen(false)
									setUpdateDialogOpen(true)
								}}
							>
								<RefreshCw size={16} />
								<span>Edit post</span>
							</DropdownMenuItem>
							<Separator className="my-1" />
							<DropdownMenuItem
								className="flex cursor-pointer items-center gap-2 text-destructive focus:text-destructive"
								onClick={() => {
									setDropdownMenuOpen(false)
									setDeleteDialogOpen(true)
								}}
							>
								<Trash2 size={16} />
								<span>Delete post</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</CardHeader>

			<CardContent className="pb-3 pt-5">
				{post.caption && (
					<p className="text-sm leading-relaxed">{post.caption}</p>
				)}

				{post.attachmentUrl && (
					<div className="mt-4 overflow-hidden rounded-md border bg-muted/20">
						{post.attachmentUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
							<img
								src={`http://localhost:8080/files/${post.attachmentUrl}`}
								alt="Post attachment"
								className="h-auto max-h-[500px] w-full object-cover"
								loading="lazy"
							/>
						) : post.attachmentUrl.match(/\.(mp4|webm|ogg)$/i) ? (
							<video
								src={`http://localhost:8080/files/${post.attachmentUrl}`}
								controls
								className="w-full rounded-md"
								preload="metadata"
							/>
						) : null}
					</div>
				)}
			</CardContent>

			<CardFooter className="flex flex-col gap-2 border-t-2 border-slate-200 pt-3 dark:border-slate-700">
				<div className="flex w-full items-center justify-between px-1 text-sm text-muted-foreground">
					<div>
						{post.likeCount > 0 &&
							`${post.likeCount} ${post.likeCount === 1 ? "like" : "likes"}`}
					</div>
					<div>
						{post.commentCount > 0 &&
							`${post.commentCount} ${
								post.commentCount === 1 ? "comment" : "comments"
							}`}
					</div>
				</div>

				<div className="flex w-full">
					<Button
						variant="ghost"
						size="sm"
						className={cn(
							"flex flex-1 items-center justify-center gap-2 rounded-full",
							post.isLiked &&
								"text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20",
						)}
						onClick={handleLikeToggle}
					>
						<Heart className={cn("h-4 w-4", post.isLiked && "fill-current")} />
						<span>{post.isLiked ? "Liked" : "Like"}</span>
					</Button>

					<Button
						variant="ghost"
						size="sm"
						className="flex flex-1 items-center justify-center gap-2 rounded-full"
						onClick={() => setIsCommentOpen(true)}
					>
						<MessageCircle className="h-4 w-4" />
						<span>Comment</span>
					</Button>
				</div>
			</CardFooter>

			{/* Update Post Dialog */}
			{postToUpdate && (
				<Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Edit Post</DialogTitle>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label htmlFor="caption" className="text-sm font-medium">
									Caption
								</Label>
								<textarea
									id="caption"
									className="min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
									value={postToUpdate.caption}
									onChange={(e) =>
										setPostToUpdate({
											...postToUpdate,
											caption: e.target.value,
										})
									}
									placeholder="What's on your mind?"
								/>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="file" className="text-sm font-medium">
									Media
								</Label>
								<div className="flex items-center gap-4">
									{(file || postToUpdate.attachmentUrl) && (
										<div className="relative h-16 w-16 overflow-hidden rounded-md border">
											<img
												src={
													file
														? URL.createObjectURL(file)
														: `http://localhost:8080/files/${postToUpdate.attachmentUrl}`
												}
												alt="Preview"
												className="h-full w-full object-cover"
											/>
										</div>
									)}
									<div className="flex-1">
										<label
											htmlFor="file-upload"
											className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-4 py-2 transition-colors hover:bg-muted/50"
										>
											<Camera size={18} />
											<span>
												{file || postToUpdate.attachmentUrl
													? "Change media"
													: "Add photo or video"}
											</span>
										</label>
										<Input
											id="file-upload"
											type="file"
											accept="image/*,video/*"
											className="hidden"
											onChange={(e) => {
												if (e.target.files?.length) {
													setFile(e.target.files[0])
												}
											}}
										/>
									</div>
								</div>
							</div>

							<div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
								<div>
									<Label
										htmlFor="private-toggle"
										className="text-sm font-medium"
									>
										Private Post
									</Label>
									<p className="text-xs text-muted-foreground">
										Only you will be able to see this post
									</p>
								</div>
								<Switch
									id="private-toggle"
									checked={postToUpdate.isPrivate}
									onCheckedChange={(checked) =>
										setPostToUpdate({ ...postToUpdate, isPrivate: checked })
									}
								/>
							</div>
						</div>
						<DialogFooter className="gap-2 sm:gap-0">
							<Button
								variant="outline"
								onClick={() => {
									setUpdateDialogOpen(false)
									setFile(null)
									setPostToUpdate(post)
								}}
							>
								Cancel
							</Button>
							<Button onClick={handleUpdatePost}>Save changes</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}

			{/* Delete Post Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Delete Post</DialogTitle>
						<DialogDescription>
							This action cannot be undone. This will permanently delete your
							post.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="mt-4 gap-2 sm:gap-0">
						<Button
							variant="outline"
							onClick={() => setDeleteDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleDeletePost}>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Comment Section */}
			<CommentSection
				postId={postId}
				isOpen={isCommentOpen}
				setIsOpen={setIsCommentOpen}
			/>
		</Card>
	)
}
