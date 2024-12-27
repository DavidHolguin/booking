'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import Image from 'next/image'

interface Hotel {
  id: string
  name: string
  description: string
  email: string
  phone: string
  website: string
  address: string
  city: string
  country: string
  postal_code: string
  latitude: number
  longitude: number
  logo_url: string | null
  cover_url: string | null
  gallery_urls: string[]
  features: string[]
  public_profile: boolean
  chatbot_enabled: boolean
  booking_enabled: boolean
  check_in_time: string
  check_out_time: string
}

export default function HotelPage() {
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchHotel()
  }, [])

  async function fetchHotel() {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (error) {
        console.error('Error al obtener información del hotel:', error)
        toast({
          title: 'Error',
          description: 'No se pudo cargar la información del hotel.',
          variant: 'destructive',
        })
      } else {
        setHotel(data)
      }
    }
    setIsLoading(false)
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
          description: 'No se pudo actualizar la información del hotel. Por favor, inténtelo de nuevo.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Éxito',
          description: 'Información del hotel actualizada correctamente.',
        })
        setIsEditing(false)
      }
    }
  }

  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file && hotel) {
      const { data, error } = await supabase.storage
        .from('hotel-logos')
        .upload(`${hotel.id}/logo.png`, file, {
          cacheControl: '3600',
          upsert: true
        })
      
      if (error) {
        toast({
          title: 'Error',
          description: 'No se pudo cargar el logo. Por favor, inténtelo de nuevo.',
          variant: 'destructive',
        })
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('hotel-logos')
          .getPublicUrl(`${hotel.id}/logo.png`)
        
        setHotel({ ...hotel, logo_url: publicUrl })
        toast({
          title: 'Éxito',
          description: 'Logo cargado correctamente.',
        })
      }
    }
  }

  if (isLoading) {
    return <div>Cargando información del hotel...</div>
  }

  if (!hotel) {
    return <div>No se encontró información del hotel.</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Información del Hotel</h1>
        <Button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancelar' : 'Editar'}
        </Button>
      </div>
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="location">Ubicación</TabsTrigger>
          <TabsTrigger value="images">Imágenes</TabsTrigger>
          <TabsTrigger value="features">Características</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleUpdateHotel} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre del Hotel</Label>
                    <Input
                      id="name"
                      value={hotel.name}
                      onChange={(e) => setHotel({ ...hotel, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={hotel.description}
                      onChange={(e) => setHotel({ ...hotel, description: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={hotel.email}
                      onChange={(e) => setHotel({ ...hotel, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={hotel.phone}
                      onChange={(e) => setHotel({ ...hotel, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Sitio Web</Label>
                    <Input
                      id="website"
                      value={hotel.website}
                      onChange={(e) => setHotel({ ...hotel, website: e.target.value })}
                    />
                  </div>
                  <Button type="submit">Guardar Cambios</Button>
                </form>
              ) : (
                <>
                  <p><strong>Nombre:</strong> {hotel.name}</p>
                  <p><strong>Descripción:</strong> {hotel.description}</p>
                  <p><strong>Correo Electrónico:</strong> {hotel.email}</p>
                  <p><strong>Teléfono:</strong> {hotel.phone}</p>
                  <p><strong>Sitio Web:</strong> {hotel.website}</p>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle>Ubicación</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleUpdateHotel} className="space-y-4">
                  <div>
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      value={hotel.address}
                      onChange={(e) => setHotel({ ...hotel, address: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      value={hotel.city}
                      onChange={(e) => setHotel({ ...hotel, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">País</Label>
                    <Input
                      id="country"
                      value={hotel.country}
                      onChange={(e) => setHotel({ ...hotel, country: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="postal_code">Código Postal</Label>
                    <Input
                      id="postal_code"
                      value={hotel.postal_code}
                      onChange={(e) => setHotel({ ...hotel, postal_code: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="latitude">Latitud</Label>
                    <Input
                      id="latitude"
                      type="number"
                      value={hotel.latitude}
                      onChange={(e) => setHotel({ ...hotel, latitude: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitud</Label>
                    <Input
                      id="longitude"
                      type="number"
                      value={hotel.longitude}
                      onChange={(e) => setHotel({ ...hotel, longitude: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                  <Button type="submit">Guardar Cambios</Button>
                </form>
              ) : (
                <>
                  <p><strong>Dirección:</strong> {hotel.address}</p>
                  <p><strong>Ciudad:</strong> {hotel.city}</p>
                  <p><strong>País:</strong> {hotel.country}</p>
                  <p><strong>Código Postal:</strong> {hotel.postal_code}</p>
                  <p><strong>Latitud:</strong> {hotel.latitude}</p>
                  <p><strong>Longitud:</strong> {hotel.longitude}</p>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Imágenes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="logo">Logo del Hotel</Label>
                  {hotel.logo_url && (
                    <div className="mt-2">
                      <Image src={hotel.logo_url} alt="Logo del Hotel" width={100} height={100} />
                    </div>
                  )}
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="cover">Imagen de Portada</Label>
                  {hotel.cover_url && (
                    <div className="mt-2">
                      <Image src={hotel.cover_url} alt="Imagen de Portada" width={300} height={200} />
                    </div>
                  )}
                  <Input
                    id="cover"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {/* Implementar lógica de carga */}}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Galería de Imágenes</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    {hotel.gallery_urls && hotel.gallery_urls.map((url, index) => (
                      <Image key={index} src={url} alt={`Imagen de galería ${index + 1}`} width={100} height={100} />
                    ))}
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {/* Implementar lógica de carga múltiple */}}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Características</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleUpdateHotel} className="space-y-4">
                  {/* Aquí iría un componente para agregar/eliminar características */}
                  <Button type="submit">Guardar Cambios</Button>
                </form>
              ) : (
                <ul className="list-disc pl-5">
                  {hotel.features && hotel.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateHotel} className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="public_profile">Perfil Público</Label>
                  <Switch
                    id="public_profile"
                    checked={hotel.public_profile}
                    onCheckedChange={(checked) => setHotel({ ...hotel, public_profile: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="chatbot_enabled">Chatbot Habilitado</Label>
                  <Switch
                    id="chatbot_enabled"
                    checked={hotel.chatbot_enabled}
                    onCheckedChange={(checked) => setHotel({ ...hotel, chatbot_enabled: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="booking_enabled">Reservas Habilitadas</Label>
                  <Switch
                    id="booking_enabled"
                    checked={hotel.booking_enabled}
                    onCheckedChange={(checked) => setHotel({ ...hotel, booking_enabled: checked })}
                  />
                </div>
                <div>
                  <Label htmlFor="check_in_time">Hora de Check-in</Label>
                  <Input
                    id="check_in_time"
                    type="time"
                    value={hotel.check_in_time}
                    onChange={(e) => setHotel({ ...hotel, check_in_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="check_out_time">Hora de Check-out</Label>
                  <Input
                    id="check_out_time"
                    type="time"
                    value={hotel.check_out_time}
                    onChange={(e) => setHotel({ ...hotel, check_out_time: e.target.value })}
                  />
                </div>
                <Button type="submit">Guardar Cambios</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

