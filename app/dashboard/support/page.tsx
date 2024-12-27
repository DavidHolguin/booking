'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

export default function SupportPage() {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject,
          message,
          status: 'open'
        })
      
      if (error) {
        toast({
          title: 'Error',
          description: 'No se pudo enviar el ticket de soporte. Por favor, inténtelo de nuevo.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Éxito',
          description: 'Ticket de soporte enviado correctamente.',
        })
        setSubject('')
        setMessage('')
      }
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Soporte Técnico</h1>
      <Card>
        <CardHeader>
          <CardTitle>Enviar Ticket de Soporte</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="subject">Asunto</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
              />
            </div>
            <Button type="submit">Enviar Ticket</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

