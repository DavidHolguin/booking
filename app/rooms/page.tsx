'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

interface Room {
  id: string
  room_number: string
  floor: string
  status: string
  room_type: {
    name: string
    capacity: number
  }
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [newRoom, setNewRoom] = useState({ room_number: '', floor: '', room_type_id: '' })
  const [roomTypes, setRoomTypes] = useState<{ id: string; name: string }[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchRooms()
    fetchRoomTypes()
  }, [])

  async function fetchRooms() {
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        id,
        room_number,
        floor,
        status,
        room_type:room_types(name, capacity)
      `)
    if (error) {
      console.error('Error fetching rooms:', error)
    } else {
      setRooms(data)
    }
  }

  async function fetchRoomTypes() {
    const { data, error } = await supabase
      .from('room_types')
      .select('id, name')
    if (error) {
      console.error('Error fetching room types:', error)
    } else {
      setRoomTypes(data)
    }
  }

  async function handleAddRoom(e: React.FormEvent) {
    e.preventDefault()
    const { data, error } = await supabase
      .from('rooms')
      .insert([newRoom])
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add room. Please try again.',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: 'Room added successfully.',
      })
      setIsDialogOpen(false)
      fetchRooms()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Rooms</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Room</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Room</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddRoom} className="space-y-4">
              <div>
                <Label htmlFor="room_number">Room Number</Label>
                <Input
                  id="room_number"
                  value={newRoom.room_number}
                  onChange={(e) => setNewRoom({ ...newRoom, room_number: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="floor">Floor</Label>
                <Input
                  id="floor"
                  value={newRoom.floor}
                  onChange={(e) => setNewRoom({ ...newRoom, floor: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="room_type">Room Type</Label>
                <select
                  id="room_type"
                  value={newRoom.room_type_id}
                  onChange={(e) => setNewRoom({ ...newRoom, room_type_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  required
                >
                  <option value="">Select a room type</option>
                  {roomTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <Button type="submit">Add Room</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <Card key={room.id}>
            <CardHeader>
              <CardTitle>Room {room.room_number}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Floor: {room.floor}</p>
              <p>Type: {room.room_type.name}</p>
              <p>Capacity: {room.room_type.capacity}</p>
              <p>Status: {room.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

