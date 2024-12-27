'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addDays, addWeeks, subWeeks, startOfMonth, endOfMonth, getHours, setHours, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, CalendarIcon, ListIcon, Loader2Icon, AlertTriangleIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Reservation {
  id: string
  room_id: string
  guest_id: string
  source: string
  external_id: string
  guest_name: string
  guest_email: string
  guest_phone: string
  check_in: string
  check_out: string
  adults: number
  children: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  total_price: number
  special_requests: string
  notes: string
  created_at: string
  updated_at: string
  rooms?: {
    room_number: string
    floor: string
    room_type_id: string
    room_types: {
      name: string
      capacity: number
    }
  }
}

interface Room {
  id: string
  room_number: string
  room_type_id: string
  floor: string
  status: string
  room_types: {
    name: string
    capacity: number
    base_price: number
  }
}

const ITEMS_PER_PAGE = 10

const statusColors = {
  'confirmed': 'bg-green-500 dark:bg-green-700',
  'pending': 'bg-yellow-500 dark:bg-yellow-700',
  'cancelled': 'bg-red-500 dark:bg-red-700',
  'completed': 'bg-blue-500 dark:bg-blue-700',
}

const initialReservation = {
  guest_name: '',
  guest_email: '',
  guest_phone: '',
  check_in: '',
  check_out: '',
  room_id: '',
  source: 'direct',
  status: 'pending',
  adults: 1,
  children: 0,
  total_price: 0,
  special_requests: '',
  notes: ''
}

export default function ReservationsPage() {
  const [hotelId, setHotelId] = useState<string | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [newReservation, setNewReservation] = useState(initialReservation)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [calendarView, setCalendarView] = useState<'dia' | 'semana' | 'mes'>('semana')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const totalPages = Math.ceil(reservations.length / ITEMS_PER_PAGE)
  const paginatedReservations = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return reservations.slice(start, start + ITEMS_PER_PAGE)
  }, [reservations, currentPage])

  useEffect(() => {
    fetchUserHotel()
  }, [])

  useEffect(() => {
    if (hotelId) {
      fetchData()
    }
  }, [hotelId])

  async function fetchUserHotel() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No se encontró usuario autenticado')

      const { data: hotels, error: hotelsError } = await supabase
        .from('hotels')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (hotelsError) throw hotelsError
      if (!hotels) throw new Error('No se encontró un hotel asociado a este usuario')

      setHotelId(hotels.id)
    } catch (error: any) {
      console.error('Error al obtener hotel:', error)
      setError(error.message)
      setIsLoading(false)
    }
  }

  async function fetchData() {
    setIsLoading(true)
    setError(null)
    try {
      await Promise.all([fetchReservations(), fetchRooms()])
    } catch (error: any) {
      console.error('Error al cargar datos:', error)
      setError('Error al cargar los datos. Por favor, inténtelo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchReservations() {
    const { data, error: fetchError } = await supabase
      .from('reservations')
      .select(`
        *,
        rooms (
          room_number,
          floor,
          room_type_id,
          room_types (
            name,
            capacity
          )
        )
      `)
      .eq('hotel_id', hotelId)
      .order('check_in', { ascending: true })

    if (fetchError) {
      throw new Error(fetchError.message)
    }

    if (data) {
      setReservations(data as Reservation[])
    }
  }

  async function fetchRooms() {
    const { data, error: fetchError } = await supabase
      .from('rooms')
      .select(`
        *,
        room_types (
          name,
          capacity,
          base_price
        )
      `)
      .eq('hotel_id', hotelId)
      .eq('status', 'available')

    if (fetchError) {
      throw new Error(fetchError.message)
    }

    if (data) {
      setRooms(data as Room[])
    }
  }

  async function handleAddReservation(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (!hotelId) throw new Error('ID de hotel no válido')
      if (new Date(newReservation.check_out) <= new Date(newReservation.check_in)) {
        throw new Error('La fecha de salida debe ser posterior a la fecha de entrada')
      }

      const { data, error } = await supabase
        .from('reservations')
        .insert([{ ...newReservation, hotel_id: hotelId }])
        .select()

      if (error) throw error

      toast({
        title: 'Éxito',
        description: 'Reserva agregada correctamente.',
      })
      
      setIsDialogOpen(false)
      setNewReservation(initialReservation)
      await fetchReservations()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo agregar la reserva. Por favor, inténtelo de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleEditReservation(reservation: Reservation) {
    setNewReservation({
      ...reservation,
      check_in: reservation.check_in.split('T')[0],
      check_out: reservation.check_out.split('T')[0],
    })
    setIsDialogOpen(true)
  }

  async function handleDeleteReservation(id: string) {
    if (!confirm('¿Está seguro de que desea eliminar esta reserva?')) return

    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: 'Éxito',
        description: 'Reserva eliminada correctamente.',
      })

      await fetchReservations()
    } catch (error: any) {
      console.error('Error al eliminar reserva:', error)
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la reserva. Por favor, inténtelo de nuevo.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2Icon className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando reservas...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangleIcon className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  function renderReservationForm() {
    return (
      <form onSubmit={handleAddReservation} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="guest_name">Nombre del Huésped</Label>
            <Input
              id="guest_name"
              value={newReservation.guest_name}
              onChange={(e) => setNewReservation({ ...newReservation, guest_name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guest_email">Correo Electrónico</Label>
            <Input
              id="guest_email"
              type="email"
              value={newReservation.guest_email}
              onChange={(e) => setNewReservation({ ...newReservation, guest_email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="check_in">Fecha de Entrada</Label>
            <Input
              id="check_in"
              type="date"
              value={newReservation.check_in}
              onChange={(e) => setNewReservation({ ...newReservation, check_in: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="check_out">Fecha de Salida</Label>
            <Input
              id="check_out"
              type="date"
              value={newReservation.check_out}
              onChange={(e) => setNewReservation({ ...newReservation, check_out: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="room_id">Habitación</Label>
            <Select 
              value={newReservation.room_id} 
              onValueChange={(value) => setNewReservation({ ...newReservation, room_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar habitación" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {`${room.room_number} - ${room.room_types?.name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select 
              value={newReservation.status} 
              onValueChange={(value: any) => setNewReservation({ ...newReservation, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="confirmed">Confirmada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Reserva
          </Button>
        </div>
      </form>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Reservas</CardTitle>
          <CardDescription>
            Administre las reservas de su hotel de manera eficiente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                onClick={() => setViewMode('list')}
              >
                <ListIcon className="mr-2 h-4 w-4" />
                Lista
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
                onClick={() => setViewMode('calendar')}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Calendario
              </Button>
              {viewMode === 'calendar' && (
                <Select value={calendarView} onValueChange={(value: 'dia' | 'semana' | 'mes') => setCalendarView(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Seleccionar vista" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dia">Día</SelectItem>
                    <SelectItem value="semana">Semana</SelectItem>
                    <SelectItem value="mes">Mes</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Nueva Reserva
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nueva Reserva</DialogTitle>
                  <DialogDescription>
                    Complete los detalles de la nueva reserva
                  </DialogDescription>
                </DialogHeader>
                {renderReservationForm()}
              </DialogContent>
            </Dialog>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {viewMode === 'list' ? (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Huésped</TableHead>
                        <TableHead>Check-in</TableHead>
                        <TableHead>Check-out</TableHead>
                        <TableHead>Habitación</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedReservations.map((reservation) => (
                        <TableRow key={reservation.id}>
                          <TableCell>{reservation.guest_name}</TableCell>
                          <TableCell>{format(parseISO(reservation.check_in), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>{format(parseISO(reservation.check_out), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>
                            {reservation.rooms?.room_number || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[reservation.status]}>
                              {reservation.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditReservation(reservation)}
                              >
                                Editar
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDeleteReservation(reservation.id)}
                              >
                                Eliminar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {totalPages > 1 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {calendarView === 'dia' && renderDayView()}
                  {calendarView === 'semana' && renderWeekView()}
                  {calendarView === 'mes' && renderMonthView()}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )

  function renderDayView() {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const dayReservations = reservations.filter(res => 
      isSameDay(parseISO(res.check_in), currentDate) || 
      isSameDay(parseISO(res.check_out), currentDate)
    )

    return (
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">
            {format(currentDate, "EEEE, d 'de' MMMM", { locale: es })}
          </h3>
        </div>
        <div className="divide-y">
          {hours.map(hour => (
            <div key={hour} className="flex">
              <div className="w-20 p-2 text-right text-sm text-gray-500">
                {format(setHours(new Date(), hour), 'HH:mm')}
              </div>
              <div className="flex-1 min-h-[60px] border-l relative">
                {dayReservations
                  .filter(res => getHours(parseISO(res.check_in)) === hour)
                  .map(res => (
                    <div
                      key={res.id}
                      className={`absolute left-0 right-0 p-2 m-1 rounded ${
                        statusColors[res.status]
                      } text-white cursor-pointer transition-opacity hover:opacity-90`}
                      onClick={() => handleEditReservation(res)}
                      style={{
                        top: '0',
                        height: '58px',
                      }}
                    >
                      <div className="text-sm font-semibold truncate">{res.guest_name}</div>
                      <div className="text-xs truncate">
                        Hab: {res.rooms?.room_number || '-'}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  function renderWeekView() {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 })
    const endDate = endOfWeek(currentDate, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: startDate, end: endDate })

    return (
      <div className="border rounded-lg">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {days.map((day, index) => (
            <div key={index} className="bg-white p-2">
              <div className="text-sm font-medium text-gray-500">
                {format(day, 'E', { locale: es })}
              </div>
              <div className="text-lg font-semibold">
                {format(day, 'd')}
              </div>
              <div className="mt-2 space-y-1">
                {reservations
                  .filter(res => isSameDay(parseISO(res.check_in), day))
                  .map(res => (
                    <div
                      key={res.id}
                      className={`p-1 rounded text-xs text-white ${
                        statusColors[res.status]
                      } cursor-pointer`}
                      onClick={() => handleEditReservation(res)}
                    >
                      <div className="font-semibold truncate">{res.guest_name}</div>
                      <div className="truncate">
                        Hab: {res.rooms?.room_number || '-'}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  function renderMonthView() {
    const startDate = startOfMonth(currentDate)
    const endDate = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start: startDate, end: endDate })
    const startDayOfWeek = startOfMonth(currentDate).getDay()

    return (
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">
            {format(currentDate, "MMMM yyyy", { locale: es })}
          </h3>
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) => (
            <div key={index} className="bg-white p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {Array.from({ length: (startDayOfWeek + 6) % 7 }).map((_, index) => (
            <div key={`empty-start-${index}`} className="bg-white p-2 min-h-[100px]" />
          ))}
          {days.map((day, index) => (
            <div
              key={index}
              className={`bg-white p-2 min-h-[100px] ${
                isSameDay(day, new Date()) ? 'bg-blue-50' : ''
              }`}
            >
              <div className="text-sm font-semibold mb-1">
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {reservations
                  .filter(res => isSameDay(parseISO(res.check_in), day))
                  .slice(0, 3)
                  .map(res => (
                    <div
                      key={res.id}
                      className={`p-1 rounded text-xs text-white ${
                        statusColors[res.status]
                      } cursor-pointer`}
                      onClick={() => handleEditReservation(res)}
                    >
                      <div className="truncate">{res.guest_name}</div>
                    </div>
                  ))}
                {reservations.filter(res => isSameDay(parseISO(res.check_in), day)).length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{reservations.filter(res => isSameDay(parseISO(res.check_in), day)).length - 3} más
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
}

