'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

interface Reservation {
  id: string
  guest_name: string
  check_in: string
  check_out: string
  status: string
  room: {
    room_number: string
  }
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [newReservation, setNewReservation] = useState({
    guest_name: '',
    guest_email: '',
    check_in: '',
    check_out: '',
    room_id: '',
  })
  const [rooms, setRooms] = useState<{ id: string; room_number: string }[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchReservations()
    fetchRooms()
  }, [])

  async function fetchReservations() {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        id,
        guest_name,
        check_in,
        check_out,
        status,
        room:rooms(room_number)
      `)
    if (error) {
      console.error('Error fetching reservations:', error)
    } else {
      setReservations(data)
    }
  }

  async function fetchRooms() {
    const { data, error } = await supabase
      .from('rooms')
      .select('id, room_number')
    if (error) {
      console.error('Error fetching rooms:', error)
    } else {
      setRooms(data)
    }
  }

  async function handleAddReservation(e: React.FormEvent) {
    e.preventDefault()
    const { data, error } = await supabase
      .from('reservations')
      .insert([newReservation])
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add reservation. Please try again.',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: 'Reservation added successfully.',
      })
      setIsDialogOpen(false)
      fetchReservations()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reservations</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Reservation</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Reservation</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddReservation} className="space-y-4">
              <div>
                <Label htmlFor="guest_name">Guest Name</Label>
                <Input
                  id="guest_name"
                  value={newReservation.guest_name}
                  onChange={(e) => setNewReservation({ ...newReservation, guest_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="guest_email">Guest Email</Label>
                <Input
                  id="guest_email"
                  type="email"
                  value={newReservation.guest_email}
                  onChange={(e) => setNewReservation({ ...newReservation, guest_email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="check_in">Check-in Date</Label>
                <Input
                  id="check_in"
                  type="date"
                  value={newReservation.check_in}
                  onChange={(e) => setNewReservation({ ...newReservation, check_in: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="check_out">Check-out Date</Label>
                <Input
                  id="check_out"
                  type="date"
                  value={newReservation.check_out}
                  onChange={(e) => setNewReservation({ ...newReservation, check_out: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="room">Room</Label>
                <select
                  id="room"
                  value={newReservation.room_id}
                  onChange={(e) => setNewReservation({ ...newReservation, room_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  required
                >
                  <option value="">Select a room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>Room {room.room_number}</option>
                  ))}
                </select>
              </div>
              <Button type="submit">Add Reservation</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reservations.map((reservation) => (
          <Card key={reservation.id}>
            <CardHeader>
              <CardTitle>{reservation.guest_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Room: {reservation.room.room_number}</p>
              <p>Check-in: {new Date(reservation.check_in).toLocaleDateString()}</p>
              <p>Check-out: {new Date(reservation.check_out).toLocaleDateString()}</p>
              <p>Status: {reservation.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

