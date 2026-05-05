import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Star, Trash2, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface Review {
  id: string;
  order_id: string;
  order_number?: string;
  product_id: number;
  product_name?: string;
  product_image?: string;
  customer_email: string;
  rating: number;
  review_text: string;
  created_at: string;
}

interface Product {
  id: number;
  name: string;
}

const ITEMS_PER_PAGE = 10;

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reviewsRes, productsRes] = await Promise.all([
        api.getReviews(),
        api.getProducts(),
      ]);

      if (reviewsRes.data) {
        setReviews(reviewsRes.data);
      } else {
        toast.error(reviewsRes.error || 'Failed to load reviews');
      }

      if (productsRes.data) {
        setProducts(productsRes.data);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, ratingFilter, reviews.length]);

  const getProductName = (productId: number): string => {
    const product = products.find((p) => p.id === productId);
    return product?.name || `Product #${productId}`;
  };

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;

    const res = await api.deleteReview(reviewToDelete.id);
    if (res.data) {
      toast.success('Review deleted successfully');
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
      loadData();
    } else {
      toast.error(res.error || 'Failed to delete review');
    }
  };

  const openDeleteDialog = (review: Review) => {
    setReviewToDelete(review);
    setDeleteDialogOpen(true);
  };

  const filteredReviews = reviews.filter((review) => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === '' ||
      review.customer_email.toLowerCase().includes(searchLower) ||
      getProductName(review.product_id).toLowerCase().includes(searchLower) ||
      (review.review_text && review.review_text.toLowerCase().includes(searchLower));

    // Rating filter
    const matchesRating =
      ratingFilter === 'all' || review.rating === parseInt(ratingFilter);

    return matchesSearch && matchesRating;
  });

  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-muted text-muted'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading reviews...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Reviews
        </h1>
        <div className="text-sm text-muted-foreground">
          {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''} ({totalPages} page{totalPages !== 1 ? 's' : ''})
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email, product, or review..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4 Stars</SelectItem>
            <SelectItem value="3">3 Stars</SelectItem>
            <SelectItem value="2">2 Stars</SelectItem>
            <SelectItem value="1">1 Star</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      <div className="rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Product</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">
                  Customer
                </th>
                <th className="text-left p-3 font-medium">Rating</th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">
                  Review
                </th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">
                  Date
                </th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedReviews.map((review) => (
                <tr
                  key={review.id}
                  className="border-t cursor-pointer hover:bg-muted/30"
                  onClick={() => setSelectedReview(review)}
                >
                  <td className="p-3">
                    <div className="font-medium">{getProductName(review.product_id)}</div>
                    {review.order_number && (
                      <div className="text-xs text-muted-foreground">
                        Order: {review.order_number}
                      </div>
                    )}
                  </td>
                  <td className="p-3 hidden md:table-cell">
                    <div className="text-sm">{review.customer_email}</div>
                  </td>
                  <td className="p-3">{renderStars(review.rating)}</td>
                  <td className="p-3 hidden lg:table-cell">
                    <div className="max-w-xs truncate text-muted-foreground">
                      {review.review_text || '-'}
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground text-xs hidden sm:table-cell">
                    {formatDate(review.created_at)}
                  </td>
                  <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => openDeleteDialog(review)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredReviews.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-muted-foreground"
                  >
                    {searchTerm || ratingFilter !== 'all'
                      ? 'No reviews match your filters'
                      : 'No reviews yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(currentPage - 1)} 
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink 
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(currentPage + 1)} 
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Review Detail Dialog */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Review Details
            </DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-muted-foreground">Product</p>
                  <p className="font-medium">{getProductName(selectedReview.product_id)}</p>
                </div>
                <div>{renderStars(selectedReview.rating)}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">Customer Email</p>
                  <p className="font-medium">{selectedReview.customer_email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(selectedReview.created_at)}</p>
                </div>
              </div>
              {selectedReview.order_number && (
                <div>
                  <p className="text-muted-foreground">Order Number</p>
                  <p className="font-medium font-mono">{selectedReview.order_number}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground mb-2">Review</p>
                <div className="p-3 bg-muted rounded-lg">
                  {selectedReview.review_text || 'No review text provided'}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteReview}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReviews;
