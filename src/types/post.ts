type Post = {
	id: string
	caption: string
	attachmentUrl: string
	createdAt: number
	editedAt: number
	isPrivate: boolean
	isLiked: boolean
	likeCount: number
	commentCount: number
}

export type { Post }
