import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "./ui/card"
import { Post } from "@/types/post"
import { User } from "@/types/user"
import postByIdApi from "@/apis/post_by_id"
import getPostCreatorApi from "@/apis/get_post_creator"
import { format } from "date-fns"
import { Button } from "./ui/button"
import { MessageCircle, MoreVertical, RefreshCw, ThumbsUp, Trash2 } from "lucide-react"
import likePostApi from "@/apis/like_post"
import unlikePostApi from "@/apis/unlike_post"
import { cn } from "@/lib/utils"
import CommentSection from "@/components/comment.tsx"
import { Link } from "react-router-dom"
import useUser from "@/stores/user-store.ts"
import {
	Dialog,
	DialogContent,
	DialogDescription, DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog.tsx"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx"
import { Label } from "@/components/ui/label.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Switch } from "@/components/ui/switch.tsx"
import updatePostApi from "@/apis/update_post.ts"
import { toast } from "react-toastify"
import deletePostApi from "@/apis/delete_post.ts"

interface PostProps {
	postId: string
}

export default function PostUI({ postId }: PostProps) {
	const [post, setPost] = useState<Post | null>(null)
	const [user, setUser] = useState<User | null>(null)
	const {
		user: currentUser,
	} = useUser()
	const [canEditPost, setCanEditPost] = useState<boolean>(false)
	const [isCommentOpen, setIsCommentOpen] = useState(false)
	const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [dropdownMenuOpen, setDropdownMenuOpen] = useState(false);
	const [postToUpdate, setPostToUpdate] = useState<Post | null>(null)
	const [file, setFile] = useState<File | null>(null)

	useEffect(() => {
		postByIdApi(postId).then(post => {
			setPost(post)
			setPostToUpdate(post)
		})
		getPostCreatorApi(postId).then(setUser)
	}, [])

	useEffect(() => {
		if (user && currentUser && user.id === currentUser.id) {
			setCanEditPost(true)
			return
		}
		setCanEditPost(false)
	}, [user, currentUser])

	if (!post || !user) {
		return <></>
	}

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<div className="flex flex-row items-center gap-4">
					<img
						src={`http://localhost:8080/files/${user!.avatarUrl}`}
						alt={`${user!.name}'s avatar`}
						className="h-10 w-10 rounded-full object-cover"
					/>
					<div className="flex flex-col">
						<span className="font-semibold">{user!.name}</span>
						<div className="flex gap-x-2">
							<Link
								to={`/post?post=${post.id}`}
								className="text-sm text-muted-foreground hover:underline"
							>
								{format(post.createdAt * 1000, "MMM d, yyyy HH:mm")}
							</Link>
							<span className="text-sm text-muted-foreground">
								{post.isPrivate ? "Private" : "Public"}
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
							<button
								onClick={() => setDropdownMenuOpen(true)}
								className="text-muted-foreground transition-colors hover:text-foreground"
							>
								<MoreVertical size={20} />
							</button>
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
								<span>Update</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								className="flex cursor-pointer items-center gap-2 text-red-500 focus:text-red-500"
								onClick={() => {
									setDropdownMenuOpen(false)
									setDeleteDialogOpen(true)
								}}
							>
								<Trash2 size={16} />
								<span>Delete</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
				{postToUpdate && (
					<Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
						<DialogContent className="sm:max-w-md">
							<DialogHeader>
								<DialogTitle>Update Item</DialogTitle>
							</DialogHeader>
							<div className="grid gap-5 py-4">
								<div className="grid gap-2">
									<Label htmlFor="caption" className="text-sm font-medium">
										Caption
									</Label>
									<textarea
										id="caption"
										className="min-h-24 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
										value={postToUpdate.caption}
										onChange={(e) =>
											setPostToUpdate({
												...postToUpdate,
												caption: e.target.value,
											})
										}
									/>
								</div>

								<div className="grid gap-2">
									<Label htmlFor="file" className="text-sm font-medium">
										Media (Optional)
									</Label>
									<Input
										id="file"
										type="file"
										accept="image/*,video/*"
										className="cursor-pointer file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
										onChange={(e) => {
											if (e.target.files?.length) {
												setFile(e.target.files[0])
											}
										}}
									/>
								</div>

								{file && (
									<div className="mt-2 overflow-hidden rounded-lg border border-gray-200">
										<img
											src={URL.createObjectURL(file)}
											alt="Preview"
											className="h-48 w-full object-cover"
										/>
									</div>
								)}

								{!file && postToUpdate.attachmentUrl && <div className="mt-2 overflow-hidden rounded-lg border border-gray-200">
									<img
										src={`http://localhost:8080/files/${postToUpdate.attachmentUrl}`}
										alt="Preview"
										className="h-48 w-full object-cover"
									/>
								</div>}

								<div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
									<div className="space-y-0.5">
										<Label
											htmlFor="private-toggle"
											className="text-sm font-medium"
										>
											Private Post
										</Label>
										<p className="text-xs text-gray-500">
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
							<DialogFooter className="mt-4">
								<Button variant="outline">Cancel</Button>
								<Button onClick={() => {
									updatePostApi(postToUpdate.id, postToUpdate.caption, postToUpdate.attachmentUrl, file, postToUpdate.isPrivate).then(() => {
										toast.success("Update post success")
									}).catch(() => {
										toast.error("Update post failed")
									}).finally(() => {
										setUpdateDialogOpen(false)
										postByIdApi(postId).then(post => {
											setPost(post)
											setPostToUpdate(post)
										})
									})
								}}>Confirm</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				)}
				<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Delete Post</DialogTitle>
							<DialogDescription>
								This action cannot be undone. Are you sure you want to delete this post?
							</DialogDescription>
						</DialogHeader>
						<DialogFooter className="mt-4">
							<Button
								variant="outline"
								onClick={() => setDeleteDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={() => {
									deletePostApi(postId).then(() => {
										toast.success("Delete post success")
									}).catch(() => {
										toast.error("Delete post failed")
									}).finally(() => {
										setDeleteDialogOpen(false)
										window.location.reload()
									})
								}}
							>
								Delete
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</CardHeader>
			<CardContent className="space-y-4">
				<p>{post.caption}</p>
				{post.attachmentUrl && (
					<div className="overflow-hidden rounded-lg flex justify-center">
						{post.attachmentUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
							<img
								src={`http://localhost:8080/files/${post.attachmentUrl}`}
								alt="Post attachment"
								className="h-auto w-full max-h-[40%] max-w-[40%]"
							/>
						) : post.attachmentUrl.match(/\.(mp4|webm|ogg)$/i) ? (
							<video
								src={`http://localhost:8080/files/${post.attachmentUrl}`}
								controls
								className="w-full"
							/>
						) : null}
					</div>
				)}
				<div className="flex w-full">
					<Button
						variant="ghost"
						className="flex flex-1 items-center gap-2"
						onClick={() => {
							if (!post.isLiked) {
								likePostApi(post.id).then(() => {
									setPost({
										...post,
										isLiked: true,
										likeCount: post.likeCount + 1,
									})
								})
								return
							}
							unlikePostApi(post.id).then(() => {
								setPost({
									...post,
									isLiked: false,
									likeCount: post.likeCount - 1,
								})
							})
						}}
					>
						{!post.isLiked && <ThumbsUp className="h-5 w-5" />}
						{post.isLiked && <ThumbsUp className="h-5 w-5 text-blue-400" />}
						<span className={cn(post.isLiked && "text-blue-400")}>
							{post.likeCount ?? 0} Likes
						</span>
					</Button>
					<Button
						onClick={() => setIsCommentOpen(true)}
						variant="ghost"
						className="flex flex-1 items-center gap-2"
					>
						<MessageCircle className="h-5 w-5" />
						<span>{post.commentCount ?? 0} Comments</span>
					</Button>
					<CommentSection
						postId={postId}
						isOpen={isCommentOpen}
						setIsOpen={setIsCommentOpen}
					/>
				</div>
			</CardContent>
		</Card>
	)
}
