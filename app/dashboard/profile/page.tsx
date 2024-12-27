'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserProfile {
  id: string
  full_name: string
  email: string
  phone: string
  avatar_url: string | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (error) {
        console.error('Error al obtener perfil:', error)
      } else {
        setProfile(data)
      }
    }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    if (profile) {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
        })
        .eq('id', profile.id)
      if (error) {
        toast({
          title: 'Error',
          description: 'No se pudo actualizar el perfil. Por favor, inténtelo de nuevo.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Éxito',
          description: 'Perfil actualizado correctamente.',
        })
        setIsEditing(false)
      }
    }
  }

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file && profile) {
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(`${profile.id}/avatar.png`, file, {
          cacheControl: '3600',
          upsert: true
        })
      
      if (error) {
        toast({
          title: 'Error',
          description: 'No se pudo cargar la imagen de perfil. Por favor, inténtelo de nuevo.',
          variant: 'destructive',
        })
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(`${profile.id}/avatar.png`)
        
        setProfile({ ...profile, avatar_url: publicUrl })
        toast({
          title: 'Éxito',
          description: 'Imagen de perfil actualizada correctamente.',
        })
      }
    }
  }

  if (!profile) {
    return <div>Cargando...</div>
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Perfil de Usuario</h1>
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback>{profile.full_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
              />
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <Button variant="outline" size="sm">
                  Cambiar imagen de perfil
                </Button>
              </Label>
            </div>
          </div>
          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Nombre Completo</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
              <Button type="submit">Guardar Cambios</Button>
            </form>
          ) : (
            <>
              <p><strong>Nombre:</strong> {profile.full_name}</p>
              <p><strong>Correo Electrónico:</strong> {profile.email}</p>
              <p><strong>Teléfono:</strong> {profile.phone}</p>
              <Button onClick={() => setIsEditing(true)} className="mt-4">Editar Perfil</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

