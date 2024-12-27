'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range'
import { addDays } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import AuthModal from '@/components/AuthModal'

interface RoomType {
  id: string
  name: string
  description: string
  capacity: number
  base_price: number
}

interface BookingEngineProps {
  hotelId: string
  isOpen: boolean
  onClose: () => void
}

export default function BookingEngine({ hotelId, isOpen, onClose }: BookingEngineProps) {
  const [step, setStep] = useState(1)
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [selectedRoomType, setSelectedRoomType] = useState<string>('')
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: addDays(new Date(), 1),
  })
  const [availableRooms, setAvailableRooms] = useState<RoomType[]>([])
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchRoomTypes()
      checkUserAuth()
    }
  }, [isOpen])

  async function checkUserAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

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
  }

  async function checkAvailability() {
    // This is a placeholder function. In a real application, you would check
    // availability against your database of reservations.
    setAvailableRooms(roomTypes.filter(room => room.capacity >= (adults + children)))
    setStep(2)
  }

  async function handleBooking() {
    if (!selectedRoomType || !dateRange.from || !dateRange.to) {
      toast({
        title: 'Error',
        description: 'Por favor, complete todos los campos.',
        variant: 'destructive',
      })
      return
    }

    if (!user) {
      setIsAuthModalOpen(true)
      return
    }

    try {
      const { data, error } = await supabase
        .from('reservations')
        .insert({
          hotel_id: hotelId,
          room_type_id: selectedRoomType,
          guest_id: user.id,
          check_in: dateRange.from,
          check_out: dateRange.to,
          adults: adults,
          children: children,
          status: 'pending',
        })

      if (error) throw error

      toast({
        title: 'Reserva exitosa',
        description: 'Su reserva ha sido confirmada.',
      })
      onClose()
    } catch (error) {
      console.error('Error creating reservation:', error)
      toast({
        title: 'Error',
        description: 'No se pudo completar la reserva. Por favor, intente de nuevo.',
        variant: 'destructive',
      })
    }
  }

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false)
    checkUserAuth()
    handleBooking()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reservar habitación</DialogTitle>
        </DialogHeader>
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={(e) => { e.preventDefault(); checkAvailability(); }} className="space-y-4">
                <div>
                  <Label>Fechas</Label>
                  <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                </div>
                <div>
                  <Label htmlFor="adults">Adultos</Label>
                  <Input
                    id="adults"
                    type="number"
                    min="1"
                    value={adults}
                    onChange={(e) => setAdults(parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="children">Niños</Label>
                  <Input
                    id="children"
                    type="number"
                    min="0"
                    value={children}
                    onChange={(e) => setChildren(parseInt(e.target.value))}
                  />
                </div>
                <Button type="submit">Buscar disponibilidad</Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Habitaciones disponibles</h3>
                {availableRooms.map((room) => (
                  <div key={room.id} className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{room.name}</h4>
                      <p className="text-sm text-gray-500">{room.description}</p>
                    </div>
                    <Button onClick={() => setSelectedRoomType(room.id)}>
                      Seleccionar (${room.base_price}/noche)
                    </Button>
                  </div>
                ))}
                {selectedRoomType && (
                  <Button onClick={handleBooking} className="w-full">
                    Confirmar reserva
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        hotelLogo="/placeholder-logo.png"
      />
    </Dialog>
  )
}

