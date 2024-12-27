'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Loader2, Plus, Trash2, Eye } from 'lucide-react'
import ImageUploader from '@/components/ImageUploader'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Hotel {
  id: string
  name: string
  description: string
  address: string
  city: string
  country: string
  phone: string
  email: string
  website: string
  check_in_time: string
  check_out_time: string
  amenities: string[]
  services: { name: string; description: string }[]
  logo_url: string | null
  cover_url: string | null
  gallery_urls: string[]
  public_profile: boolean
}

const defaultHotel: Hotel = {
  id: '',
  name: '',
  description: '',
  address: '',
  city: '',
  country: '',
  phone: '',
  email: '',
  website: '',
  check_in_time: '',
  check_out_time: '',
  amenities: [],
  services: [],
  logo_url: null,
  cover_url: null,
  gallery_urls: [],
  public_profile: false,
}

export default function PublicProfilePage() {
  const [hotel, setHotel] = useState<Hotel>(defaultHotel)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [newAmenity, setNewAmenity] = useState('')
  const [newService, setNewService] = useState({ name: '', description: '' })
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchHotel()
  }, [])

  async function fetchHotel() {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('hotels')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error) throw error

        setHotel({
          ...defaultHotel,
          ...data,
          amenities: data.amenities || [],
          services: data.services || [],
          gallery_urls: data.gallery_urls || [],
        })
      }
    } catch (error) {
      console.error('Error fetching hotel:', error)
      toast({
        title: 'Error',
        description: 'No se pudo cargar la información del hotel.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUpdateHotel(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('hotels')
        .update(hotel)
        .eq('id', hotel.id)

      if (error) throw error

      toast({
        title: 'Éxito',
        description: 'Información del hotel actualizada correctamente.',
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating hotel:', error)
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la información del hotel.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddAmenity = () => {
    if (newAmenity.trim() !== '') {
      setHotel(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }))
      setNewAmenity('')
    }
  }

  const handleRemoveAmenity = (index: number) => {
    setHotel(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }))
  }

  const handleAddService = () => {
    if (newService.name.trim() !== '' && newService.description.trim() !== '') {
      setHotel(prev => ({
        ...prev,
        services: [...prev.services, newService]
      }))
      setNewService({ name: '', description: '' })
    }
  }

  const handleRemoveService = (index: number) => {
    setHotel(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-32">
      <Card>
        <CardHeader>
          <CardTitle>Perfil Público del Hotel</CardTitle>
          <CardDescription>
            Gestiona la información pública de tu hotel y habilita las reservas en línea.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <Switch
                checked={hotel.public_profile}
                onCheckedChange={(checked) => setHotel({ ...hotel, public_profile: checked })}
              />
              <Label>Perfil Público {hotel.public_profile ? 'Activado' : 'Desactivado'}</Label>
            </div>
            <Button onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancelar' : 'Editar Perfil'}
            </Button>
          </div>

          <Tabs defaultValue="general">
            <TabsList className="mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="images">Imágenes</TabsTrigger>
              <TabsTrigger value="amenities">Servicios y Comodidades</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <form onSubmit={handleUpdateHotel} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre del Hotel</Label>
                    <Input
                      id="name"
                      value={hotel.name}
                      onChange={(e) => setHotel({ ...hotel, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Sitio Web</Label>
                    <Input
                      id="website"
                      value={hotel.website}
                      onChange={(e) => setHotel({ ...hotel, website: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={hotel.description}
                    onChange={(e) => setHotel({ ...hotel, description: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      value={hotel.address}
                      onChange={(e) => setHotel({ ...hotel, address: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      value={hotel.city}
                      onChange={(e) => setHotel({ ...hotel, city: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="country">País</Label>
                    <Input
                      id="country"
                      value={hotel.country}
                      onChange={(e) => setHotel({ ...hotel, country: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={hotel.phone}
                      onChange={(e) => setHotel({ ...hotel, phone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="check_in_time">Hora de Check-in</Label>
                    <Input
                      id="check_in_time"
                      type="time"
                      value={hotel.check_in_time}
                      onChange={(e) => setHotel({ ...hotel, check_in_time: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="check_out_time">Hora de Check-out</Label>
                    <Input
                      id="check_out_time"
                      type="time"
                      value={hotel.check_out_time}
                      onChange={(e) => setHotel({ ...hotel, check_out_time: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                {isEditing && (
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                )}
              </form>
            </TabsContent>

            <TabsContent value="images">
              <div className="space-y-6">
                <ImageUploader
                  label="Logo del Hotel"
                  onImageUpload={(url) => setHotel({ ...hotel, logo_url: url })}
                  currentImage={hotel.logo_url || undefined}
                />
                <ImageUploader
                  label="Imagen de Portada"
                  onImageUpload={(url) => setHotel({ ...hotel, cover_url: url })}
                  currentImage={hotel.cover_url || undefined}
                />
                <div>
                  <Label>Galería de Imágenes</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    {hotel.gallery_urls.map((url, index) => (
                      <div key={index} className="relative">
                        <img src={url} alt={`Imagen ${index + 1}`} className="w-full h-40 object-cover rounded-md" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => setHotel(prev => ({
                            ...prev,
                            gallery_urls: prev.gallery_urls.filter((_, i) => i !== index)
                          }))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <ImageUploader
                      label="Agregar imagen a la galería"
                      onImageUpload={(url) => setHotel(prev => ({
                        ...prev,
                        gallery_urls: [...prev.gallery_urls, url]
                      }))}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="amenities">
              <div className="space-y-6">
                <div>
                  <Label>Comodidades</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {hotel.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center bg-secondary text-secondary-foreground rounded-full px-3 py-1">
                        <span>{amenity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2 h-4 w-4"
                          onClick={() => handleRemoveAmenity(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex mt-2">
                    <Input
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      placeholder="Nueva comodidad"
                      className="mr-2"
                    />
                    <Button onClick={handleAddAmenity}>Agregar</Button>
                  </div>
                </div>
                <div>
                  <Label>Servicios</Label>
                  <div className="space-y-4 mt-2">
                    {hotel.services.map((service, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => handleRemoveService(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <p>{service.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="mt-4">
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar Servicio
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Agregar Nuevo Servicio</DialogTitle>
                        <DialogDescription>
                          Ingrese los detalles del nuevo servicio que ofrece su hotel.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="serviceName">Nombre del Servicio</Label>
                          <Input
                            id="serviceName"
                            value={newService.name}
                            onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="serviceDescription">Descripción del Servicio</Label>
                          <Textarea
                            id="serviceDescription"
                            value={newService.description}
                            onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAddService}>Agregar Servicio</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 flex justify-center">
        <Button 
          onClick={() => router.push(`/hotel/${hotel.id}`)}
          className="w-full max-w-md"
          size="lg"
        >
          <Eye className="w-4 h-4 mr-2" />
          Ver Perfil Público
        </Button>
      </div>
    </div>
  )
}

