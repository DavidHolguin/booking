'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'

interface Hotel {
  id: string
  name: string
  description: string
  email: string
  phone: string
  address: string
  city: string
  country: string
}

export default function HotelPage() {
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchHotel()
  }, [])

  async function fetchHotel() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (error) {
        console.error('Error fetching hotel:', error)
      } else {
        setHotel(data)
      }
    }
  }

  async function handleUpdateHotel(e: React.FormEvent) {
    e.preventDefault()
    if (hotel) {
      const { error } = await supabase
        .from('hotels')
        .update(hotel)
        .eq('id', hotel.id)
      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update hotel information. Please try again.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Hotel information updated successfully.',
        })
        setIsEditing(false)
      }
    }
  }

  if (!hotel) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Hotel Information</h1>
        <Button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancel' : 'Edit'}
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{hotel.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleUpdateHotel} className="space-y-4">
              <div>
                <Label htmlFor="name">Hotel Name</Label>
                <Input
                  id="name"
                  value={hotel.name}
                  onChange={(e) => setHotel({ ...hotel, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={hotel.description}
                  onChange={(e) => setHotel({ ...hotel, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={hotel.email}
                  onChange={(e) => setHotel({ ...hotel, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={hotel.phone}
                  onChange={(e) => setHotel({ ...hotel, phone: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={hotel.address}
                  onChange={(e) => setHotel({ ...hotel, address: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={hotel.city}
                  onChange={(e) => setHotel({ ...hotel, city: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={hotel.country}
                  onChange={(e) => setHotel({ ...hotel, country: e.target.value })}
                  required
                />
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          ) : (
            <>
              <p><strong>Description:</strong> {hotel.description}</p>
              <p><strong>Email:</strong> {hotel.email}</p>
              <p><strong>Phone:</strong> {hotel.phone}</p>
              <p><strong>Address:</strong> {hotel.address}</p>
              <p><strong>City:</strong> {hotel.city}</p>
              <p><strong>Country:</strong> {hotel.country}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

