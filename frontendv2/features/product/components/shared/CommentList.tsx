import { Star } from "lucide-react"

export interface Comment {
  id: string
  author: {
    name: string
    isStaff?: boolean
  }
  content: string
  createdAt: string
  rating?: number
  replies?: Comment[]
}

interface CommentListProps {
  comments: Comment[]
  showRating?: boolean
}

export function CommentList({ comments, showRating = false }: CommentListProps) {
  const formatDate = (date: string) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
    return `${days} ngày trước`
  }

  return (
    <div className="space-y-8">
      {comments.map((comment) => (
        <div key={comment.id} className="relative pl-12 pb-8">
          {/* Timeline line */}
          <div className="absolute left-5 top-10 bottom-0 w-[1px] bg-gray-200" />

          <div className="relative">
            {/* User Avatar */}
            <div className="absolute -left-12 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {comment.author.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>

            {/* Comment Content */}
            <div>
              <h3 className="font-medium">{comment.author.name}</h3>
              {showRating && comment.rating && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 fill-warning-5 text-warning-5" />
                  <span className="text-sm">{comment.rating}.0</span>
                </div>
              )}
              <p className="mt-1 text-gray-600">{comment.content}</p>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <span className="text-gray-500">{formatDate(comment.createdAt)}</span>
                <span className="text-gray-300">•</span>
                <button className="text-primary-5 hover:underline">Trả lời</button>
              </div>

              {/* Staff Replies */}
              {comment.replies?.map((reply) => (
                <div key={reply.id} className="mt-4 pl-12 relative">
                  {/* Staff Avatar */}
                  <div className="absolute -left-0 w-8 h-8 rounded-full overflow-hidden border-2 border-white">
                    <img src="/logo.png" alt="Long Châu" className="h-full w-full object-cover" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{reply.author.name}</span>
                      {reply.author.isStaff && <span className="text-primary-5 text-sm">(Được sĩ)</span>}
                    </div>
                    <p className="mt-1 text-gray-600 whitespace-pre-line">{reply.content}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <span className="text-gray-500">{formatDate(reply.createdAt)}</span>
                      <span className="text-gray-300">•</span>
                      <button className="text-primary-5 hover:underline">Trả lời</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

