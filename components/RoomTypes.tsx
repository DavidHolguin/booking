'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface RoomType {
  id: string
  name: string
  description: string
  capacity: number
  base_price: number
  image_url: string
}

interface RoomTypesProps {
  hotelId: string
  onBookingClick: () => void
}

export default function RoomTypes({ hotelId, onBookingClick }: RoomTypesProps) {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRoomTypes()
  }, [])

  async function fetchRoomTypes() {
    const { data, error } = await supabase
      .from('room_types')
      .select('*')
      .eq('hotel_id', hotelId)

    if (error) {
      console.error('Error fetching room types:', error)
    } else {
      setRoomTypes(data)
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return <div>Cargando tipos de habitaciones...</div>
  }

  return (
    <Tabs defaultValue={roomTypes[0]?.id}>
      <TabsList>
        {roomTypes.map((roomType) => (
          <TabsTrigger key={roomType.id} value={roomType.id}>
            {roomType.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {roomTypes.map((roomType) => (
        <TabsContent key={roomType.id} value={roomType.id}>
          <Card>
            <CardHeader>
              <CardTitle>{roomType.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Image
                    src={roomType.image_url || '/placeholder-room.jpg'}
                    alt={roomType.name}
                    width={400}
                    height={300}
                    objectFit="cover"
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <p className="mb-2">{roomType.description}</p>
                  <p className="mb-2">Capacidad: {roomType.capacity} personas</p>
                  <p className="mb-4">Precio: ${roomType.base_price} / noche</p>
                  <Button onClick={onBookingClick}>Reservar ahora</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  )
}

