'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LayoutGrid, List, Pencil, Trash2, Upload, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Room {
  id: string
  room_number: string
  floor: string
  status: string
  hotel_id: string
  image_url?: string
  thumbnail_url?: string
  room_type: {
    id: string
    name: string
    capacity: number
  }
}

interface RoomType {
  id: string
  name: string
  capacity: number
}

interface FormData {
  room_number: string
  floor: string
  room_type_id: string
  status: string
  image_url: string
  thumbnail_url: string
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  const initialFormState: FormData = {
    room_number: '',
    floor: '',
    room_type_id: '',
    status: 'available',
    image_url: '',
    thumbnail_url: ''
  }

  const [formData, setFormData] = useState<FormData>(initialFormState)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([fetchRooms(), fetchRoomTypes()])
    } catch (error) {
      console.error('Error fetching initial data:', error)
      toast({
        title: 'Error',
        description: 'Error al cargar los datos iniciales',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          id,
          room_number,
          floor,
          status,
          hotel_id,
          room_type:room_types (
            id,
            name,
            capacity
          )
        `)
        .order('room_number')

      if (error) throw error

      const roomsWithImages = data?.map(room => ({
        ...room,
        image_url: room.image_url || '/stock-hotel-room.jpg' 
      })) || []

      setRooms(roomsWithImages)
    } catch (error) {
      console.error('Error fetching rooms:', error)
      throw error
    }
  }

  const fetchRoomTypes = async () => {
    try {
      const { data: types, error } = await supabase
        .from('room_types')
        .select('*')
        .order('name')

      if (error) throw error

      setRoomTypes(types || [])
    } catch (error) {
      console.error('Error fetching room types:', error)
      throw error
    }
  }

  const handleEdit = (room: Room) => {
    setSelectedRoom(room)
    setIsEditMode(true)
    setFormData({
      room_number: room.room_number,
      floor: room.floor,
      room_type_id: room.room_type.id,
      status: room.status,
      image_url: room.image_url || '',
      thumbnail_url: room.thumbnail_url || ''
    })
    setDialogOpen(true)
  }

  const handleDelete = async (roomId: string) => {
    try {
      setIsLoading(true)
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId)

      if (error) throw error

      await fetchRooms()
      toast({
        title: 'Éxito',
        description: 'Habitación eliminada correctamente',
      })
    } catch (error) {
      console.error('Error deleting room:', error)
      toast({
        title: 'Error',
        description: 'Error al eliminar la habitación',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('room-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('room-images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  const resetForm = () => {
    setFormData(initialFormState)
    setImageFile(null)
    setSelectedRoom(null)
    setIsEditMode(false)
    setDialogOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let imageUrl = formData.image_url
      if (imageFile) {
        const uploadedUrl = await handleImageUpload(imageFile)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        }
      }

      const roomData = {
        room_number: formData.room_number,
        floor: formData.floor,
        room_type_id: formData.room_type_id,
        status: formData.status,
        image_url: imageUrl,
      }

      if (isEditMode && selectedRoom) {
        const { error } = await supabase
          .from('rooms')
          .update(roomData)
          .eq('id', selectedRoom.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('rooms')
          .insert([roomData])

        if (error) throw error
      }

      await fetchRooms()
      resetForm()
      toast({
        title: 'Éxito',
        description: isEditMode ? 'Habitación actualizada correctamente' : 'Habitación creada correctamente',
      })
    } catch (error) {
      console.error('Error submitting room:', error)
      toast({
        title: 'Error',
        description: 'Error al guardar la habitación',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const statusColors = {
    available: 'bg-green-100 text-green-800',
    occupied: 'bg-red-100 text-red-800',
    maintenance: 'bg-yellow-100 text-yellow-800'
  }

  const statusTranslations = {
    available: 'Disponible',
    occupied: 'Ocupada',
    maintenance: 'Mantenimiento'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando habitaciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Habitaciones</h1>
        <div className="flex space-x-4">
          <div className="flex space-x-2 border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setIsEditMode(false); setFormData(initialFormState) }}>
                Añadir Habitación
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {isEditMode ? 'Editar Habitación' : 'Añadir Nueva Habitación'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="room_number">Número de Habitación</Label>
                    <Input
                      id="room_number"
                      value={formData.room_number}
                      onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="floor">Piso</Label>
                    <Input
                      id="floor"
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="room_type">Tipo de Habitación</Label>
                    <select
                      id="room_type"
                      value={formData.room_type_id}
                      onChange={(e) => setFormData({ ...formData, room_type_id: e.target.value })}
                      className="w-full border border-input bg-background rounded-md px-3 py-2"
                      required
                    >
                      <option value="">Seleccionar tipo</option>
                      {roomTypes.map((type) => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full border border-input bg-background rounded-md px-3 py-2"
                      required
                    >
                      <option value="available">Disponible</option>
                      <option value="occupied">Ocupada</option>
                      <option value="maintenance">Mantenimiento</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Imagen de la Habitación</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="cursor-pointer"
                  />
                  {(formData.image_url || imageFile) && (
                    <div className="mt-2">
                      <img
                        src={imageFile ? URL.createObjectURL(imageFile) : formData.image_url}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditMode ? 'Actualizar' : 'Añadir'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Card key={room.id} className="overflow-hidden">
              <div className="relative h-48">
                <img
                  src={room.image_url || '/stock-hotel-room.jpg'}
                  alt={`Habitación ${room.room_number}`}
                  className="w-full h-full object-cover"
                />
                <div className={cn('absolute top-2 right-2 px-2 py-1 rounded-full text-sm font-medium',
                  statusColors[room.status as keyof typeof statusColors])}>
                  {statusTranslations[room.status as keyof typeof statusTranslations]}
                </div>
              </div>
              <CardHeader>
                <CardTitle>Habitación {room.room_number}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Piso: {room.floor}</p>
                <p className="text-sm text-muted-foreground">Tipo: {room.room_type.name}</p>
                <p className="text-sm text-muted-foreground">Capacidad: {room.room_type.capacity} personas</p>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(room)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Eliminará permanentemente la habitación
                        y todos sus datos asociados.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(room.id)}
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Imagen</TableHead>
                <TableHead>Número</TableHead>
                <TableHead>Piso</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Capacidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>
                    <img
                      src={room.image_url || '/stock-hotel-room.jpg'}
                      alt={`Habitación ${room.room_number}`}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell>{room.room_number}</TableCell>
                  <TableCell>{room.floor}</TableCell>
                  <TableCell>{room.room_type.name}</TableCell>
                  <TableCell>{room.room_type.capacity}</TableCell>
                  <TableCell>
                    <span className={cn('px-2 py-1 rounded-full text-sm font-medium',
                      statusColors[room.status as keyof typeof statusColors])}>
                      {statusTranslations[room.status as keyof typeof statusTranslations]}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(room)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Eliminará permanentemente la habitación
                              y todos sus datos asociados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(room.id)}
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

