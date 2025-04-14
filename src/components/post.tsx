import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "./ui/card"
import { Post } from "@/types/post"
import { User } from "@/types/user"
import postByIdApi from "@/apis/post_by_id"
import getPostCreatorApi from "@/apis/get_post_creator"
import { format } from "date-fns"
import { Button } from "./ui/button"
import { MessageCircle, ThumbsUp } from "lucide-react"
import likePostApi from "@/apis/like_post"
import unlikePostApi from "@/apis/unlike_post"
import { cn } from "@/lib/utils"
import CommentSection from "@/components/comment.tsx"
import { Link } from "react-router-dom"

interface PostProps {
	postId: string
}

export default function PostUI({ postId }: PostProps) {
	const [post, setPost] = useState<Post | null>(null)
	const [user, setUser] = useState<User | null>(null)
	const [isCommentOpen, setIsCommentOpen] = useState(false)

	useEffect(() => {
		postByIdApi(postId).then(setPost)
		getPostCreatorApi(postId).then(setUser)
	}, [])

	if (!post || !user) {
		return <></>
	}

	return (
		<Card>
			<CardHeader className="flex flex-row items-center gap-4">
				<img
					src={`http://localhost:8080/files/${user!.avatarUrl}`}
					alt={`${user!.name}'s avatar`}
					className="h-10 w-10 rounded-full object-cover"
				/>
				<div className="flex flex-col">
					<span className="font-semibold">{user!.name}</span>
					<Link to={`/post?post=${post.id}`} className="text-sm text-muted-foreground hover:underline">
						{format(post.createdAt * 1000, "MMM d, yyyy HH:mm")}
					</Link>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<p>{post.caption}</p>
				{post.attachmentUrl && (
					<div className="overflow-hidden rounded-lg">
						{post.attachmentUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
							<img
								src={`http://localhost:8080/files/${post.attachmentUrl}`}
								alt="Post attachment"
								className="h-auto w-full"
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
						<span className={cn(post.isLiked && "text-blue-400")}>{post.likeCount ?? 0} Likes</span>
					</Button>
					<Button onClick={() => setIsCommentOpen(true)} variant="ghost" className="flex flex-1 items-center gap-2">
						<MessageCircle className="h-5 w-5" />
						<span>{post.commentCount ?? 0} Comments</span>
					</Button>
					<CommentSection postId={postId} isOpen={isCommentOpen} setIsOpen={setIsCommentOpen}/>
				</div>
			</CardContent>
		</Card>
	)
}
