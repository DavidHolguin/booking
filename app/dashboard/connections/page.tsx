'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Switch } from '@/components/ui/switch'
import { motion, AnimatePresence } from 'framer-motion'
import { FaList, FaTh } from 'react-icons/fa'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface OTAConnection {
  id: string
  ota_name: string
  api_key: string
  is_active: boolean
  color: string
  description: string
  is_configured: boolean
}

const otaProviders = [
  { name: 'Booking', color: '#003580', description: 'Connect with Booking.com, one of the world\'s leading digital travel companies.' },
  { name: 'Trivago', color: '#007faf', description: 'Integrate with Trivago, a global hotel search platform.' },
  { name: 'Airbnb', color: '#ff5a5f', description: 'Link your property with Airbnb, the popular online marketplace for lodging and tourism experiences.' },
  { name: 'Expedia', color: '#00355f', description: 'Connect to Expedia Group, which powers major travel booking sites.' },
  { name: 'Hotels.com', color: '#d32f2f', description: 'Integrate with Hotels.com, a leading lodging booking platform.' },
  { name: 'TripAdvisor', color: '#00a680', description: 'Connect with TripAdvisor, the world\'s largest travel guidance platform.' },
]

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<OTAConnection[]>([])
  const [newConnection, setNewConnection] = useState({
    ota_name: '',
    api_key: '',
    api_secret: '',
    color: '',
    description: '',
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
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
      const connectionsWithProviderInfo = otaProviders.map(provider => {
        const existingConnection = data?.find(conn => conn.ota_name === provider.name)
        return existingConnection ? {
          ...existingConnection,
          color: provider.color,
          description: provider.description,
          is_configured: !!existingConnection.api_key
        } : {
          id: '',
          ota_name: provider.name,
          api_key: '',
          is_active: false,
          color: provider.color,
          description: provider.description,
          is_configured: false
        }
      })
      setConnections(connectionsWithProviderInfo)
    }
  }

  async function handleAddConnection(e: React.FormEvent, ota_name: string) {
    e.preventDefault()
    const { data, error } = await supabase
      .from('ota_connections')
      .insert([{ ...newConnection, ota_name }])
    
    if (error) {
      toast({
        title: 'Error',
        description: 'No se pudo agregar la conexión. Por favor, inténtelo de nuevo.',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Éxito',
        description: 'Conexión agregada correctamente.',
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
        description: 'No se pudo actualizar el estado de la conexión. Por favor, inténtelo de nuevo.',
        variant: 'destructive',
      })
    } else {
      fetchConnections()
    }
  }

  const ConnectionCard = ({ connection }: { connection: OTAConnection }) => (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: connection.color }}></div>
            <span>{connection.ota_name}</span>
          </CardTitle>
          <CardDescription>{connection.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {connection.is_configured ? (
            <>
              <p className="mb-2">API Key: {connection.api_key.slice(0, 6)}...</p>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={connection.is_active}
                  onCheckedChange={() => toggleConnectionStatus(connection.id, connection.is_active)}
                />
                <Label>{connection.is_active ? 'Activo' : 'Inactivo'}</Label>
              </div>
            </>
          ) : (
            <Button onClick={() => {
              setNewConnection({ ...newConnection, ota_name: connection.ota_name })
              setIsDialogOpen(true)
            }}>Configurar</Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )

  const ConnectionList = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>OTA</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>API Key</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {connections.map((connection) => (
          <TableRow key={connection.ota_name}>
            <TableCell>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: connection.color }}></div>
                <span>{connection.ota_name}</span>
              </div>
            </TableCell>
            <TableCell>
              {connection.is_configured ? (
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Configurado
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-100 text-gray-800">
                  No configurado
                </Badge>
              )}
            </TableCell>
            <TableCell>
              {connection.is_configured ? connection.api_key.slice(0, 6) + '...' : 'N/A'}
            </TableCell>
            <TableCell>
              {connection.is_configured ? (
                <Switch
                  checked={connection.is_active}
                  onCheckedChange={() => toggleConnectionStatus(connection.id, connection.is_active)}
                />
              ) : (
                <Button onClick={() => {
                  setNewConnection({ ...newConnection, ota_name: connection.ota_name })
                  setIsDialogOpen(true)
                }}>Configurar</Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Conexiones OTA</h1>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <FaTh />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <FaList />
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {connections.map((connection) => (
                <ConnectionCard key={connection.ota_name} connection={connection} />
              ))}
            </div>
          ) : (
            <ConnectionList />
          )}
        </motion.div>
      </AnimatePresence>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Conexión OTA: {newConnection.ota_name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => handleAddConnection(e, newConnection.ota_name)} className="space-y-4">
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
            <Button type="submit">Agregar Conexión</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

