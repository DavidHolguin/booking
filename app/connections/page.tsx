'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Switch } from '@/components/ui/switch'

interface OTAConnection {
  id: string
  ota_name: string
  api_key: string
  is_active: boolean
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<OTAConnection[]>([])
  const [newConnection, setNewConnection] = useState({
    ota_name: '',
    api_key: '',
    api_secret: '',
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchConnections()
  }, [])

  async function fetchConnections() {
    const { data, error } = await supabase
      .from('ota_connections')
      .select('*')
    if (error) {
      console.error('Error fetching connections:', error)
    } else {
      setConnections(data)
    }
  }

  async function handleAddConnection(e: React.FormEvent) {
    e.preventDefault()
    const { data, error } = await supabase
      .from('ota_connections')
      .insert([newConnection])
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add connection. Please try again.',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: 'Connection added successfully.',
      })
      setIsDialogOpen(false)
      fetchConnections()
    }
  }

  async function toggleConnectionStatus(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('ota_connections')
      .update({ is_active: !currentStatus })
      .eq('id', id)
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update connection status. Please try again.',
        variant: 'destructive',
      })
    } else {
      fetchConnections()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">OTA Connections</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Connection</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New OTA Connection</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddConnection} className="space-y-4">
              <div>
                <Label htmlFor="ota_name">OTA Name</Label>
                <Input
                  id="ota_name"
                  value={newConnection.ota_name}
                  onChange={(e) => setNewConnection({ ...newConnection, ota_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="api_key">API Key</Label>
                <Input
                  id="api_key"
                  value={newConnection.api_key}
                  onChange={(e) => setNewConnection({ ...newConnection, api_key: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="api_secret">API Secret</Label>
                <Input
                  id="api_secret"
                  type="password"
                  value={newConnection.api_secret}
                  onChange={(e) => setNewConnection({ ...newConnection, api_secret: e.target.value })}
                  required
                />
              </div>
              <Button type="submit">Add Connection</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {connections.map((connection) => (
          <Card key={connection.id}>
            <CardHeader>
              <CardTitle>{connection.ota_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>API Key: {connection.api_key}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Switch
                  checked={connection.is_active}
                  onCheckedChange={() => toggleConnectionStatus(connection.id, connection.is_active)}
                />
                <Label>{connection.is_active ? 'Active' : 'Inactive'}</Label>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

