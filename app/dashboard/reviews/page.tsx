'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Star, ThumbsUp, ThumbsDown, MoreVertical, Filter } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

interface Review {
  id: string
  user_name: string
  rating: number
  comment: string
  created_at: string
  helpful_count: number
  not_helpful_count: number
  status: 'published' | 'pending' | 'rejected'
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'published' | 'pending' | 'rejected'>('all')
  const [sort, setSort] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest')
  const [replyText, setReplyText] = useState('')
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const hotelId = searchParams.get('hotelId')

  const reviewsPerPage = 5

  useEffect(() => {
    if (hotelId) {
      fetchReviews()
    }
  }, [hotelId])

  useEffect(() => {
    filterAndSortReviews()
  }, [reviews, filter, sort, searchTerm])

  async function fetchReviews() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('hotel_reviews')
        .select('*')
        .eq('hotel_id', hotelId)

      if (error) throw error

      setReviews(data || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las reseñas.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  function filterAndSortReviews() {
    let result = [...reviews]

    // Filter
    if (filter !== 'all') {
      result = result.filter(review => review.status === filter)
    }

    // Search
    if (searchTerm) {
      result = result.filter(review => 
        review.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sort
    switch (sort) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case 'highest':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'lowest':
        result.sort((a, b) => a.rating - b.rating)
        break
    }

    setFilteredReviews(result)
    setCurrentPage(1)
  }

  const handleStatusChange = async (reviewId: string, newStatus: 'published' | 'pending' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('hotel_reviews')
        .update({ status: newStatus })
        .eq('id', reviewId)

      if (error) throw error

      setReviews(reviews.map(review => 
        review.id === reviewId ? { ...review, status: newStatus } : review
      ))
      toast({
        title: 'Éxito',
        description: 'Estado de la reseña actualizado correctamente.',
      })
    } catch (error) {
      console.error('Error updating review status:', error)
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado de la reseña.',
        variant: 'destructive',
      })
    }
  }

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReview) return

    // Here you would typically send the reply to your backend
    // For this example, we'll just show a success message
    toast({
      title: 'Éxito',
      description: 'Respuesta enviada correctamente.',
    })
    setReplyText('')
    setSelectedReview(null)
  }

  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Reseñas de Clientes</CardTitle>
          <CardDescription>Gestiona y responde a las reseñas de tus huéspedes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="published">Publicadas</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="rejected">Rechazadas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sort} onValueChange={(value: any) => setSort(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Más recientes</SelectItem>
                  <SelectItem value="oldest">Más antiguas</SelectItem>
                  <SelectItem value="highest">Mayor puntuación</SelectItem>
                  <SelectItem value="lowest">Menor puntuación</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Buscar reseñas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-auto"
              />
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {paginatedReviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>{review.user_name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{review.user_name}</CardTitle>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStatusChange(review.id, 'published')}>
                          Publicar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(review.id, 'pending')}>
                          Marcar como pendiente
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(review.id, 'rejected')}>
                          Rechazar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{review.comment}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{new Date(review.created_at).toLocaleDateString()}</span>
                    <div className="flex items-center">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      <span>{review.helpful_count}</span>
                    </div>
                    <div className="flex items-center">
                      <ThumbsDown className="w-4 h-4 mr-1" />
                      <span>{review.not_helpful_count}</span>
                    </div>
                    <span className="capitalize">{review.status}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setSelectedReview(review)}
                  >
                    Responder
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredReviews.length > reviewsPerPage && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                {Array.from({ length: Math.ceil(filteredReviews.length / reviewsPerPage) }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setCurrentPage(i + 1)}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(page => Math.min(Math.ceil(filteredReviews.length / reviewsPerPage), page + 1))}
                    disabled={currentPage === Math.ceil(filteredReviews.length / reviewsPerPage)}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Responder a la reseña</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReplySubmit} className="space-y-4">
            <div>
              <Label htmlFor="reply">Tu respuesta</Label>
              <Textarea
                id="reply"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                required
              />
            </div>
            <Button type="submit">Enviar respuesta</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

