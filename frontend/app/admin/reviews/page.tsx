"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorMessage } from "@/components/ui/error-message"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import {
  fetchReviews,
  fetchProducts,
  fetchUsers,
  deleteReview,
  markReviewAsRead,
  likeReview,
  replyToReview,
} from "@/lib/mockData"
import type { Review, Product, User } from "@/lib/mockData"
import { toast } from "@/components/ui/use-toast"
import { Star, Trash2, Eye, ChevronUp, ChevronDown, MessageSquare, ThumbsUp, Check, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { MultiSelect } from "@/components/ui/multi-select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"

export default function ReviewsPage() {
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    rating: "",
    products: [] as string[],
    readStatus: "",
    dateRange: { from: undefined, to: undefined } as { from: Date | undefined; to: Date | undefined },
  })
  const [sortConfig, setSortConfig] = useState<{ key: keyof Review; direction: "asc" | "desc" }>({
    key: "created_at",
    direction: "desc",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({})
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [fetchedReviews, fetchedProducts, fetchedUsers] = await Promise.all([
          fetchReviews(),
          fetchProducts(),
          fetchUsers(),
        ])
        setReviews(fetchedReviews)
        setProducts(fetchedProducts)
        setUsers(fetchedUsers)
      } catch (err) {
        setError("Failed to fetch data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleSort = (key: keyof Review) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteReview(id)
      setReviews(reviews.filter((review) => review.id !== id))
      toast({ title: "Review deleted", description: "The review has been successfully deleted." })
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete review. Please try again.", variant: "destructive" })
    } finally {
      setShowDeleteConfirm(null)
    }
  }

  const handleReadStatusChange = async (id: string, isRead: boolean) => {
    try {
      await markReviewAsRead(id)
      setReviews(reviews.map((review) => (review.id === id ? { ...review, admin_read: isRead } : review)))
      toast({
        title: "Review status updated",
        description: `The review has been marked as ${isRead ? "read" : "unread"}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update review status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleLike = async (id: string, liked: boolean) => {
    try {
      await likeReview(id, liked)
      setReviews(
        reviews.map((review) =>
          review.id === id ? { ...review, likes: liked ? review.likes + 1 : review.likes - 1 } : review,
        ),
      )
      toast({ title: "Review liked", description: `The review has been ${liked ? "liked" : "unliked"}.` })
    } catch (error) {
      toast({ title: "Error", description: "Failed to like/unlike review. Please try again.", variant: "destructive" })
    }
  }

  const handleReply = async (id: string) => {
    try {
      await replyToReview(id, replyContent[id])
      setReviews(
        reviews.map((review) =>
          review.id === id
            ? { ...review, admin_reply: replyContent[id], admin_reply_at: new Date().toISOString() }
            : review,
        ),
      )
      setReplyContent((prev) => ({ ...prev, [id]: "" }))
      toast({ title: "Reply added", description: "Your reply has been added to the review." })
    } catch (error) {
      toast({ title: "Error", description: "Failed to add reply. Please try again.", variant: "destructive" })
    }
  }

  const filteredAndSortedReviews = reviews
    .filter((review) => {
      const user = users.find((u) => u.id === review.user_id)
      const product = products.find((p) => p.id === review.product_id)
      const matchesSearch =
        review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product?.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRating = filters.rating ? review.star === Number.parseInt(filters.rating) : true
      const matchesProducts = filters.products.length === 0 || filters.products.includes(review.product_id)
      const matchesReadStatus =
        filters.readStatus === "" ||
        (filters.readStatus === "read" && review.admin_read) ||
        (filters.readStatus === "unread" && !review.admin_read)
      const matchesDateRange =
        (!filters.dateRange.from || new Date(review.created_at) >= filters.dateRange.from) &&
        (!filters.dateRange.to || new Date(review.created_at) <= filters.dateRange.to)
      return matchesSearch && matchesRating && matchesProducts && matchesReadStatus && matchesDateRange
    })
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1
      return 0
    })

  const paginatedReviews = filteredAndSortedReviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalPages = Math.ceil(filteredAndSortedReviews.length / itemsPerPage)

  const unreadReviewsCount = reviews.filter((review) => !review.admin_read).length

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Product Reviews</h1>

      {unreadReviewsCount > 0 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold">You have {unreadReviewsCount} unread reviews.</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input
              placeholder="Search reviews, users, or products..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Select onValueChange={(value) => handleFilterChange("rating", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <SelectItem key={rating} value={rating.toString()}>
                    {rating} Star{rating > 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <MultiSelect
              options={products.map((product) => ({ label: product.name, value: product.id }))}
              value={filters.products}
              onChange={(value) => handleFilterChange("products", value)}
              placeholder="Filter by products"
            />
            <Select onValueChange={(value) => handleFilterChange("readStatus", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by read status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
              </SelectContent>
            </Select>
            <DatePickerWithRange onChange={(value) => handleFilterChange("dateRange", value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Read Status</TableHead>
                <TableHead className="w-[100px]">Rating</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("created_at")}>
                  Created At{" "}
                  {sortConfig.key === "created_at" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="inline" />
                    ) : (
                      <ChevronDown className="inline" />
                    ))}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("updated_at")}>
                  Updated At{" "}
                  {sortConfig.key === "updated_at" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="inline" />
                    ) : (
                      <ChevronDown className="inline" />
                    ))}
                </TableHead>
                <TableHead>Admin Reply</TableHead>
                <TableHead>Likes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedReviews.map((review) => {
                const user = users.find((u) => u.id === review.user_id)
                const product = products.find((p) => p.id === review.product_id)
                return (
                  <TableRow key={review.id} className={review.admin_read ? "text-gray-500" : ""}>
                    <TableCell>
                      {review.admin_read ? (
                        <Check className="text-green-500" />
                      ) : (
                        <AlertCircle className="text-red-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          className={index < review.star ? "text-yellow-400 fill-current" : "text-gray-300"}
                        />
                      ))}
                    </TableCell>
                    <TableCell>
                      {review.content.length > 50 ? `${review.content.substring(0, 50)}...` : review.content}
                    </TableCell>
                    <TableCell>
                      <Button variant="link" onClick={() => router.push(`/admin/users/${user?.id}`)}>
                        {user?.name}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button variant="link" onClick={() => router.push(`/admin/products/${product?.id}`)}>
                        {product?.name}
                      </Button>
                    </TableCell>
                    <TableCell>{format(new Date(review.created_at), "PPP")}</TableCell>
                    <TableCell>{format(new Date(review.updated_at), "PPP")}</TableCell>
                    <TableCell>
                      {review.admin_reply ? (
                        <span>{review.admin_reply.substring(0, 30)}...</span>
                      ) : (
                        <Badge variant="outline">No Reply</Badge>
                      )}
                    </TableCell>
                    <TableCell>{review.likes}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Review Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <p>
                                <strong>Rating:</strong> {review.star}
                              </p>
                              <p>
                                <strong>Content:</strong> {review.content}
                              </p>
                              <p>
                                <strong>User:</strong> {user?.name}
                              </p>
                              <p>
                                <strong>Product:</strong> {product?.name}
                              </p>
                              <p>
                                <strong>Created At:</strong> {format(new Date(review.created_at), "PPP")}
                              </p>
                              <p>
                                <strong>Updated At:</strong> {format(new Date(review.updated_at), "PPP")}
                              </p>
                              {review.admin_reply && (
                                <div>
                                  <p>
                                    <strong>Admin Reply:</strong> {review.admin_reply}
                                  </p>
                                  <p>
                                    <strong>Replied At:</strong> {format(new Date(review.admin_reply_at!), "PPP")}
                                  </p>
                                </div>
                              )}
                              <p>
                                <strong>Likes:</strong> {review.likes}
                              </p>
                            </div>
                            <div className="flex justify-end space-x-2 mt-4">
                              <Button onClick={() => handleReadStatusChange(review.id, !review.admin_read)}>
                                Mark as {review.admin_read ? "Unread" : "Read"}
                              </Button>
                              <Button onClick={() => handleLike(review.id, true)}>Like</Button>
                              {!review.admin_reply && <Button onClick={() => setSelectedReview(review)}>Reply</Button>}
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReadStatusChange(review.id, !review.admin_read)}
                        >
                          {review.admin_read ? <AlertCircle className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleLike(review.id, true)}>
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        {!review.admin_reply && (
                          <Button variant="ghost" size="sm" onClick={() => setSelectedReview(review)}>
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        )}
                        <ConfirmationDialog
                          title="Delete Review"
                          message="Are you sure you want to delete this review?"
                          onConfirm={() => handleDelete(review.id)}
                        >
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </ConfirmationDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredAndSortedReviews.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No reviews found.</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span>Show</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder={itemsPerPage} />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((value) => (
                <SelectItem key={value} value={value.toString()}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>items per page</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span>{`Page ${currentPage} of ${totalPages}`}</span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {selectedReview && (
        <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reply to Review</DialogTitle>
            </DialogHeader>
            <Textarea
              value={replyContent[selectedReview.id] || ""}
              onChange={(e) => setReplyContent({ ...replyContent, [selectedReview.id]: e.target.value })}
              placeholder="Type your reply here..."
            />
            <div className="flex justify-end space-x-2 mt-4">
              <Button onClick={() => setSelectedReview(null)}>Cancel</Button>
              <Button
                onClick={() => {
                  handleReply(selectedReview.id)
                  setSelectedReview(null)
                }}
              >
                Send Reply
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

