'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { AlertTriangle } from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  created_at: string
}

export function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchNotifications()
  }, [])

  async function fetchNotifications() {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      setNotifications(data || [])

      if (data.length === 0) {
        // Si no hay notificaciones, crear una de bienvenida
        const { error: insertError } = await supabase
          .from('notifications')
          .insert([
            { 
              title: 'Bienvenido', 
              message: '¡Bienvenido a nuestro sistema de gestión hotelera! Estamos encantados de tenerte aquí. Explora todas las funcionalidades y no dudes en contactarnos si necesitas ayuda.',
              type: 'info',
              read: false
            }
          ])
        
        if (insertError) throw insertError

        // Volver a cargar las notificaciones para incluir la de bienvenida
        fetchNotifications()
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setError('No se pudieron cargar las notificaciones.')
    } finally {
      setIsLoading(false)
    }
  }

  async function markAsRead(id: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)

      if (error) throw error

      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast({
        title: 'Error',
        description: 'No se pudo marcar la notificación como leída.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return <div className="p-4">Cargando notificaciones...</div>
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Notificaciones
          {error && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toast({ title: 'Error', description: error, variant: 'destructive' })}
            >
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <p>No tienes notificaciones.</p>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className={`mb-4 p-2 rounded ${notification.read ? 'bg-gray-100 dark:bg-gray-800' : 'bg-blue-100 dark:bg-blue-900'}`}>
                <h3 className="font-bold">{notification.title}</h3>
                <p>{notification.message}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(notification.created_at).toLocaleString()}</p>
                {!notification.read && (
                  <Button onClick={() => markAsRead(notification.id)} variant="outline" size="sm" className="mt-2">
                    Marcar como leída
                  </Button>
                )}
              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

