'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star } from 'lucide-react'

interface Review {
  id: string
  user_name: string
  rating: number
  comment: string
  created_at: string
}

interface ReviewsProps {
  hotelId: string
}

const dummyReviews: Review[] = [
  {
    id: '1',
    user_name: 'Juan Pérez',
    rating: 5,
    comment: 'Excelente hotel, el servicio fue impecable y las instalaciones son de primera.',
    created_at: '2023-06-15T10:30:00Z',
  },
  {
    id: '2',
    user_name: 'María González',
    rating: 4,
    comment: 'Muy buena experiencia en general. La ubicación es perfecta para explorar la ciudad.',
    created_at: '2023-06-10T14:45:00Z',
  },
  {
    id: '3',
    user_name: 'Carlos Rodríguez',
    rating: 5,
    comment: 'El desayuno buffet es increíble, con una gran variedad de opciones. Definitivamente volveré.',
    created_at: '2023-06-05T09:15:00Z',
  },
]

export default function Reviews({ hotelId }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [])

  async function fetchReviews() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('hotel_id', hotelId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error

      if (data && data.length > 0) {
        setReviews(data)
      } else {
        setReviews(dummyReviews)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setReviews(dummyReviews)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Cargando reseñas...</div>
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Avatar>
                <AvatarFallback>{review.user_name[0]}</AvatarFallback>
              </Avatar>
              <span>{review.user_name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={`h-4 w-4 ${
                    index < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
            <p className="text-sm text-gray-500 mt-2">
              {new Date(review.created_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

